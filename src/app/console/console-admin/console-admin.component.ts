import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsoleComponent } from '../console.component';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { CommunityService } from '../../_services/community/community.service';
import { ScholarshipService } from '../../_services/scholarship/scholarship.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TopicService } from '../../_services/topic/topic.service';
import { LanguagePickerService } from '../../_services/languagepicker/languagepicker.service';
import { CountryPickerService } from '../../_services/countrypicker/countrypicker.service';
declare var moment: any;


@Component({
	selector: 'app-console-admin',
	templateUrl: './console-admin.component.html',
	styleUrls: ['./console-admin.component.scss']
})
export class ConsoleAdminComponent implements OnInit {
	public collectionsLoaded: boolean;
	public unapprovedCollections: Array<any>;
	public unapprovedPeers;
	public peersLoaded: boolean;
	public envVariable;
	public emailSubscriptions: Array<any>;
	public emailSubLoaded: boolean;
	public communityRequestsLoaded: boolean;
	public communityRequests: Array<any>;
	public connectedIdentities;
	public verifiedItems;
	public displayedColumns = ['createdAt', 'email'];
	public scholarship: any;
	public scholarshipsLoaded: Boolean;
	public topicForm: FormGroup;
	public languageForm: FormGroup;


	constructor(
		activatedRoute: ActivatedRoute,
		consoleComponent: ConsoleComponent,
		public _collectionService: CollectionService,
		public _profileService: ProfileService,
		public snackBar: MatSnackBar,
		private _communityService: CommunityService,
		private _scholarshipService: ScholarshipService,
		private _dialogsService: DialogsService,
		private _fb: FormBuilder,
		private _topicService: TopicService,
		private _LanguagePickerService: LanguagePickerService,
		private countryPickerService: CountryPickerService
	) {
		this.envVariable = environment;
		activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleComponent.setActiveTab(urlSegment[0].path);
		});
	}

	ngOnInit() {
		this.fetchCollections();
		this.fetchPeers();
		this.fetchEmailSubscriptions();
		this.fetchCommunityRequests();
		this.fetchScholarShips();
		this.initForms();
	}

	private initForms() {
		this.topicForm = this._fb.group({
			name: ''
		});
		this.languageForm = this._fb.group({
			name: '',
			code: ''
		});
	}

	/**
	 * fetchScholarShips
	 */
	public fetchScholarShips() {
		const filter = { 'include': [{ 'owner': 'profiles' }, 'peers_joined', 'allowed_collections'] };
		this._scholarshipService.fetchScholarships(filter).subscribe((res: any) => {
			console.log(res);
			this.scholarshipsLoaded = true;
			if (res.length > 0) {
				this.scholarship = res[0];
			}
		}, err => {
			this.scholarshipsLoaded = true;
		});
	}

	private fetchCommunityRequests() {
		const filter = {
			'include': [{ 'peers': ['profiles'] }]
		};
		this._communityService.getRequestedComminities(JSON.stringify(filter)).subscribe((res: any) => {
			this.communityRequests = res;
			this.communityRequestsLoaded = true;
		});
	}

	private fetchEmailSubscriptions() {
		this.emailSubLoaded = false;
		const filter = {
			order: 'createdAt DESC'
		};
		this._profileService.getEmailSubscriptions(filter).subscribe(result => {
			this.emailSubscriptions = result;
			this.emailSubLoaded = true;
		});
	}

	private fetchPeers() {
		this.peersLoaded = false;
		const query = {
			'where': { 'accountVerified': 'false' },
			'include': [
				'profiles', 'identities', 'credentials'
			],
			'order': 'createdAt DESC'
		};
		this._profileService.getAllPeers(query).subscribe((result: any) => {
			this.unapprovedPeers = result;
			if (this.unapprovedPeers) {
				this.unapprovedPeers.forEach(peer => {
					if (peer.identities && peer.identities.length > 0) {
						peer.identities.forEach(element => {
							if (element.provider === 'google') {
								peer['google'] = true;
							} else if (element.provider === 'facebook') {
								peer['facebook'] = true;
							}
						});
					}
					if (peer.credentials && peer.credentials.length > 0) {
						peer.credentials.forEach(element => {
							if (element.provider === 'google') {
								peer['google'] = true;
							} else if (element.provider === 'facebook') {
								peer['facebook'] = true;
							}
						});
					}
				});
			}
			this.peersLoaded = true;
		}, err => {
			console.log(err);
		});
	}

	private fetchCollections() {
		this.collectionsLoaded = false;
		const query = {
			'where': { 'isApproved': false, 'status': 'submitted' },
			'include': [
				'calendars',
				{ 'owners': ['profiles', 'topicsTeaching'] }
			],
			'order': 'submittedAt DESC'
		};
		this._collectionService.getAllCollections(query).subscribe(
			(result: any) => {
				this.unapprovedCollections = result;
				this.collectionsLoaded = true;
			}, err => {
				console.log(err);
			}
		);
	}

	public approveClass(collection: any) {

		this._collectionService.approveCollection(collection).subscribe(
			(result: any) => {
				if (result) {
					this.fetchCollections();
					this.snackBar.open(result.result, 'Close', {
						duration: 5000
					}).onAction().subscribe();
				}
			}, err => {
				console.log(err);
			}
		);
	}

	public rejectClass(collection: any) {

		this._collectionService.rejectCollection(collection).subscribe(
			(result: any) => {
				if (result) {
					this.fetchCollections();
					this.snackBar.open(result.result, 'Close', {
						duration: 5000
					}).onAction().subscribe();
				}
			}, err => {
				console.log(err);
			}
		);
	}

	/**
	 * approvePeer
	 */
	public approvePeer(peer) {
		this._profileService.approvePeer(peer).subscribe((result: any) => {
			if (result) {
				this.fetchPeers();
				this.snackBar.open(result.result, 'Close', {
					duration: 5000
				}).onAction().subscribe();
			}

		}, err => {
			console.log(err);
		});
	}

	/**
	 * rejectPeer
	 */
	public rejectPeer(peer) {
		this._profileService.deletePeer(peer.id).subscribe((result: any) => {
			if (result) {
				this.fetchPeers();
				this.snackBar.open('Peer profile rejected. Account has been deleted from system.', 'Close', {
					duration: 5000
				});
			}
		}, err => {
			console.log(err);
		});
	}

	/**
	 * deleteRequest
		id: string
	*/
	public deleteRequest(id: string) {
		this._communityService.deleteRequest(id).subscribe(res => {
			this.snackBar.open('Deleted Request', 'close', {
				duration: 5000
			});
			this.fetchCommunityRequests();
		});
	}

	public createScholarship() {
		this._dialogsService.createScholarshipDialog(
			{ type: 'public' }
		).flatMap(res => {
			if (res) {
				return this._scholarshipService.createScholarship(res.scholarshipForm);
			}
		}).subscribe(res => {
			console.log(res);
			this.fetchScholarShips();
			this.snackBar.open('Scholarship created', 'close', { duration: 5000 });
		}, err => {
			this.snackBar.open('Error', 'close', { duration: 5000 });
		});

	}

	/**
	 * deleteScholarship
	 */
	public deleteScholarship(id: string) {
		this._scholarshipService.deleteScholarship(id).subscribe(res => {
			this.snackBar.open('Deleted');
			this.fetchScholarShips();
		});

	}

	/**
	 * editScholarship
	 */
	public editScholarship() {
		this._dialogsService.createScholarshipDialog(this.scholarship)
			.flatMap(res => {
				if (res) {
					return this._scholarshipService.patchScholarship(this.scholarship.id, res.scholarshipForm);
				}
			})
			.subscribe(res => {
				console.log(res);
				this.snackBar.open('Updated', 'Close', {
					duration: 5000
				});
				this.fetchScholarShips();
			});
	}

	public createTopics() {
		this._topicService.addNewTopic(this.topicForm.value.name).subscribe(res => {
			this.topicForm.reset();
			this.snackBar.open('Added', 'Close', {
				duration: 5000
			});
		});
	}

	public createLanguage() {
		this._LanguagePickerService.addLanguage(this.languageForm.value).subscribe(res => {
			this.languageForm.reset();
			this.snackBar.open('Added', 'Close', {
				duration: 5000
			});
		});
	}
	addCountries() {
		this.countryPickerService.postInbuiltCountries().subscribe(res => {
			this.snackBar.open('posted successfully', 'close', { duration: 3000 });
		}, err => {
			this.snackBar.open('Error', 'close', { duration: 3000 });
		});
	}
}
