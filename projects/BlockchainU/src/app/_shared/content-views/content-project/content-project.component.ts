import { Component, OnInit, Inject, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ProjectSubmissionService } from '../../../_services/project-submission/project-submission.service';
import * as moment from 'moment';
import { ContentService } from '../../../_services/content/content.service';
import { Router } from '@angular/router';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { SocketService } from '../../../_services/socket/socket.service';
import { CollectionService } from '../../../_services/collection/collection.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { environment } from '../../../../environments/environment';

@Component({
	selector: 'app-content-project',
	templateUrl: './content-project.component.html',
	styleUrls: ['./content-project.component.scss']
})
export class ContentProjectComponent implements OnInit {

	@Input() data: any;


	public noImage = 'assets/images/no-image.jpg';
	public defaultProfileUrl = '/assets/images/avatar.png';
	public hasPublicSubmission = false;
	public isSubmissionPossible = false;
	public publicSubmissionCount = 0;
	public attachmentUrls = [];
	// api: VgAPI;
	public userId;
	public startedView;
	public userType = 'public';
	public envVariable;

	@Output() exitDialog: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor(
		public projectSubmissionService: ProjectSubmissionService,
		private contentService: ContentService,
		// private deviceService: DeviceDetectorService,
		private router: Router,
		private cookieUtilsService: CookieUtilsService,
		private _socketService: SocketService,
		public _collectionService: CollectionService,
		public _dialogsService: DialogsService
	) {

	}

	ngOnInit() {
		this.envVariable = environment;
		this.userId = this.cookieUtilsService.getValue('userId');
		this.userType = this.data.userType;
		if (this.data.content.submissions !== undefined) {
			this.data.content.submissions.forEach(submission => {
				if (submission.isPrivate === 'false') {
					this.hasPublicSubmission = true;
					this.publicSubmissionCount++;
				}
			});
		}
		if (this.data.startDate !== undefined) {
			const startDateMoment = moment(this.data.startDate);
			this.isSubmissionPossible = moment().diff(startDateMoment) <= 0;
		}
		this.data.content.supplementUrls.forEach(file => {
			this.contentService.getMediaObject(file).subscribe((res: any) => {
				this.attachmentUrls.push(res[0]);
			});
		});
	}

	// public onPlayerReady(api: VgAPI) {
	// 	this.api = api;

	// 	this.api.getDefaultMedia().subscriptions.playing.subscribe(() => {
	// 		const view = {
	// 			type: 'user',
	// 			url: this.router.url,
	// 			ip_address: '',
	// 			browser: '', // this.deviceService.getDeviceInfo().browser,
	// 			viewedModelName: 'content',
	// 			startTime: new Date(),
	// 			content: this.data.content,
	// 			viewer: {
	// 				id: this.userId
	// 			}
	// 		};
	// 		this._socketService.sendStartView(view);
	// 		this._socketService.listenForViewStarted().subscribe(startedView => {
	// 			this.startedView = startedView;
	// 			console.log(startedView);
	// 		});
	// 	});

	// 	this.api.getDefaultMedia().subscriptions.pause.subscribe(() => {
	// 		this.startedView.viewer = {
	// 			id: this.userId
	// 		};
	// 		this.startedView.endTime = new Date();
	// 		this._socketService.sendEndView(this.startedView);
	// 		this._socketService.listenForViewEnded().subscribe(endedView => {
	// 			delete this.startedView;
	// 			console.log(endedView);
	// 		});
	// 	});
	// }

	openSubmitEntryDialog(data: any) {
		this._dialogsService.submitEntry(data).subscribe(res => {
			if (res) {
				this.exitDialog.next(true);
				this.exitDialog.complete();
			}
		});
	}

	openViewEntryDialog(data: any) {
		this._dialogsService.viewEntry(data);
	}

	public viewSubmission(submissionId) {
		const query = '{"include":[{"upvotes":"peer"}, {"peer": "profiles"}, ' +
			'{"comments": [{"peer": {"profiles": "work"}}, {"replies": [{"peer": {"profiles": "work"}}]}]}]}';
		this.projectSubmissionService.viewSubmission(submissionId, query).subscribe((response: any) => {
			if (response) {
				this._dialogsService.submissionView(this.data.userType, response, this.data.peerHasSubmission, this.data.collectionId)
					.subscribe(res => {
						console.log(res);
						if (res) {
							this.exitDialog.next(true);
							this.exitDialog.complete();
						}
					});
			}
		});
	}

	public calculateDate(fromdate, day) {
		const tempMoment = moment(fromdate);
		tempMoment.add(day, 'days');
		return tempMoment.format('ddd, MMM DD YYYY');
	}

	public openProfilePage(peerId) {
		this.router.navigate(['profile', peerId]);
	}

}
