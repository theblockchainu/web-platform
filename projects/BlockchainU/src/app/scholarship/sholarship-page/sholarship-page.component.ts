import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { ScholarshipService } from '../../_services/scholarship/scholarship.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material';
declare var FB: any;

@Component({
	selector: 'app-sholarship-page',
	templateUrl: './sholarship-page.component.html',
	styleUrls: ['./sholarship-page.component.scss']
})
export class SholarshipPageComponent implements OnInit {
	loadingScholarship: boolean;
	scholarship: any;
	scholarshipId: string;
	userId: string;
	initialised = false;
	accountApproved: string;
	joined = false;
	public userType: string;
	constructor(
		private activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService,
		private _scholarshipService: ScholarshipService,
		private router: Router,
		private dialogsService: DialogsService,
		private matSnackBar: MatSnackBar
	) {
	}

	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			if (this.initialised && (this.scholarshipId !== params['scholarshipId'])) {
				location.reload();
			}
			this.scholarshipId = params['scholarshipId'];
		});
		this.userId = this._cookieUtilsService.getValue('userId');
		this.initialised = true;
		this.initializePage();
		this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
	}

	initializePage() {
		let filter;
		if (this.scholarshipId === 'global') {
			filter =  {
				'include': [
					{ 'owner': 'profiles' },
					{'peers_joined': 'profiles'},
					{
						'allowed_collections': [
							'calendars',
							{
								'owners': ['profiles']
							},
							{ 'participants': 'profiles' },
							'topics',
						]
					}
				],
				'where': {
					type: 'public'
				}
			};
			this._scholarshipService.fetchScholarships(filter)
				.subscribe((res: any) => {
					this.scholarship = res[0];
					this.scholarshipId = this.scholarship.id;
					console.log(this.scholarship);
					if (this.scholarship.owner[0].id === this.userId) {
						this.userType = 'owner';
					} else {
						this.userType = 'public';
					}
					for (let index = 0; (!this.joined && index < this.scholarship.peers_joined.length); index++) {
						const peer = this.scholarship.peers_joined[index];
						if (peer.id === this.userId) {
							this.joined = true;
							if (!this.userType) {
								this.userType = 'student';
							}
						}
					}
				});
		} else {
			filter = {
				'include': [
					{ 'owner': 'profiles' },
					{'peers_joined': 'profiles'},
					{
						'allowed_collections': [
							'calendars',
							{
								'owners': ['profiles']
							},
							{ 'participants': 'profiles' },
							'topics',
						]
					}
				]
			};
			this._scholarshipService.fetchScholarship(this.scholarshipId, filter)
				.subscribe((res: any) => {
					this.scholarship = res;
					console.log(this.scholarship);
					if (this.scholarship.owner[0].id === this.userId) {
						this.userType = 'owner';
					} else {
						this.userType = 'public';
					}
					console.log(this.userType);
					for (let index = 0; (!this.joined && index < this.scholarship.peers_joined.length); index++) {
						const peer = this.scholarship.peers_joined[index];
						if (peer.id === this.userId) {
							this.joined = true;
							if (!this.userType) {
								this.userType = 'student';
							}
						}
					}
				});
		}
	}

	openCollection(collection: any) {
		this.router.navigateByUrl('/' + collection.type + '/' + collection.id);
	}


	joinSholarship() {
		this._scholarshipService.joinScholarship(this.userId, this.scholarshipId).subscribe(res => {
			this.router.navigate(['console', 'account', 'scholarships']);
			this.matSnackBar.open('Joined Scholarship', 'Close', { duration: 600 });
		});
	}

	public openInviteFriendsDialog() {
		const shareObject = this.scholarship;
		shareObject.type = 'scholarship';
		this.dialogsService.inviteFriends(shareObject);
	}


	public shareOnFb() {
		FB.ui({
			method: 'share_open_graph',
			action_type: 'og.shares',
			action_properties: JSON.stringify({
				object: {
					'og:url': environment.clientUrl + this.router.url, // your url to share
					'og:title': this.scholarship.title,
					'og:site_name': 'The Blockchain University',
					'og:description': this.scholarship.description
				}
			})
		}, function (response) {
			console.log('response is ', response);
		});
	}
}
