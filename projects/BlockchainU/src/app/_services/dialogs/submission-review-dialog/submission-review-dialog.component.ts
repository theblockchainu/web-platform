import { Component, OnInit, Inject } from '@angular/core';
import { CollectionService } from '../../collection/collection.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProjectSubmissionService } from '../../project-submission/project-submission.service';
import { MatDialog } from '@angular/material';
import { SubmissionViewComponent } from '../submission-view/submission-view.component';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material';
import { GenericPromptDialogComponent } from '../generic-prompt-dialog/generic-prompt-dialog.component';
import { flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Component({
	selector: 'app-submission-review-dialog',
	templateUrl: './submission-review-dialog.component.html',
	styleUrls: ['./submission-review-dialog.component.scss']
})
export class SubmissionReviewDialogComponent implements OnInit {

	public collectionData: any;
	public peersArray: Array<PeerObject>;
	public noImage = 'assets/images/no-image.jpg';
	public defaultProfileUrl = '/assets/images/avatar.png';
	public envVariable;
	public rewardOptions: Array<any>;
	public loadingData: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<SubmissionReviewDialogComponent>,
		private collectionService: CollectionService,
		private projectSubmissionService: ProjectSubmissionService,
		public dialog: MatDialog,
		private matSnackBar: MatSnackBar
	) {
		this.envVariable = environment;

	}

	ngOnInit() {
		this.fetchSubmissions();
	}

	private fetchSubmissions() {
		this.loadingData = true;
		this.peersArray = [];
		const query = {
			include: [
				{ 'rewards': { 'winners': 'profiles' } },
				{
					'contents':
					{
						'submissions':
						{
							'peer': ['profiles', 'reviewsAboutYou', 'ownedCollections']
						}
					}
				}
			]
		};
		this.collectionService.getCollectionDetail(this.data, query).subscribe(res => {
			this.collectionData = res;
			this.filterData();
		});
	}

	private filterData() {
		this.rewardOptions = this.collectionData.rewards;
		this.collectionData.contents.forEach(content => {
			if (content.submissions) {
				content.submissions.forEach(submission => {
					this.findAndPushSubmission(submission);
				});
			}
		});

		this.collectionData.rewards.forEach(reward => {
			if (reward.winners && reward.winners.length > 0) {
				this.findAndPushReward(reward);
			}
		});
		this.loadingData = false;
	}

	private findAndPushReward(reward) {
		const searchedIndex = this.peersArray.findIndex((a) => {
			return a.peer.id === reward.winners[0].id;
		});
		if (searchedIndex >= 0) {
			this.peersArray[searchedIndex].reward = reward;
		}
	}

	private findAndPushSubmission(submission: any) {
		const pushIndex = this.peersArray.findIndex((a) => {
			return a.peer.id === submission.peer[0].id;
		});
		if (pushIndex >= 0) {
			this.peersArray[pushIndex].submissions.push(submission);
		} else {
			this.peersArray.push({
				peer: submission.peer[0],
				submissions: [submission],
				reward: null
			});
		}
	}

	public viewSubmission(submissionId) {
		const query = '{"include":[{"upvotes":"peer"}, {"peer": "profiles"}, ' +
			'{"comments": [{"peer": {"profiles": "work"}}, {"replies": [{"peer": {"profiles": "work"}}]}]}]}';
		this.projectSubmissionService.viewSubmission(submissionId, query).subscribe((response: any) => {
			if (response) {
				this.submissionView(this.data.userType, response, this.data.peerHasSubmission, this.data.collectionId)
					.subscribe();
			}
		});
	}

	private submissionView(userType, submission, peerHasSubmission, collectionId) {
		return this.dialog.open(SubmissionViewComponent, {
			data: {
				userType: userType,
				submission: submission,
				peerHasSubmission: peerHasSubmission,
				collectionId: collectionId
			},
			panelClass: 'responsive-dialog', width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	public onPositionChange(event: any, peerObject: PeerObject) {
		this.loadingData = true;
		console.log(event);
		console.log(peerObject);
		this.checkConflicts(event, peerObject).subscribe(res => {
			if (res) {
				console.log('linking peer');
				this.linkPeer(event.id, peerObject.peer.id);
			} else {
				this.fetchSubmissions();
			}
		});
	}

	private linkPeer(rewardId, peerId) {
		const unlinkPeerIds = [];
		this.rewardOptions.forEach(rewardOption => {
			if (rewardOption.winners && rewardOption.winners[0].id === peerId) {
				unlinkPeerIds.push(rewardOption.id);
			}
		});
		console.log(unlinkPeerIds);
		this.collectionService.unlinkPeerFromRewards(unlinkPeerIds, peerId).pipe(
			flatMap(res => {
				console.log('unlinked');
				return this.collectionService.linkPeertoReward(rewardId, peerId);
			})
		).subscribe(res => {
			console.log('linked');
			this.fetchSubmissions();
		});
	}

	private checkConflicts(event: any, peerObject: PeerObject) {
		console.log('check conflict');
		let conflictPresent = false;
		let message;
		this.rewardOptions.forEach(reward => {
			if (reward.id === event.id) {
				if (reward.winners && reward.winners[0] && reward.winners[0].id !== peerObject.peer.id) {
					message = 'You already gave that position to ' + reward.winners[0].profiles[0].first_name
						+ '. Are you sure you want to assign it to ' + peerObject.peer.profiles[0].first_name;
					conflictPresent = true;
				}
			}
		});
		if (conflictPresent) {
			return this.promptDialog(message);
		} else {
			return new Observable(observer => {
				observer.next(true);
			});
		}
	}

	public promptDialog(message: string) {
		return this.dialog.open(GenericPromptDialogComponent, {
			data: message,
			panelClass: 'responsive-dialog', width: '45vw',
			height: '30vh'
		}).afterClosed();
	}

	public makeAnnouncement() {
		this.promptDialog('Are you sure you want to announce the results. This will lock further actions on this bounty.')
			.subscribe(res => {
				if (res) {
					this.collectionService.announceResult(this.data).subscribe(result => {
						console.log(result);
						this.fetchSubmissions();
					});
				}
			});
	}
}

interface PeerObject {
	peer: any;
	submissions: Array<any>;
	reward?: any;
}
