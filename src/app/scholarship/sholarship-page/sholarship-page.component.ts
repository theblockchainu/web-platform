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
		const filter = {
			'include': [{ 'owner': 'profiles' }, 'peers_joined',
				{
					'allowed_collections': [
						'calendars',
						{
							'owners': ['profiles']
						},
						{ 'participants': 'profiles' },
						'topics',
					]
				}]
		};
		this._scholarshipService.fetchScholarship(this.scholarshipId, filter)
			.subscribe((res: any) => {
				this.scholarship = res;
				console.log(this.scholarship);
				for (let index = 0; (!this.joined && index < this.scholarship.peers_joined.length); index++) {
					const peer = this.scholarship.peers_joined[index];
					if (peer.id === this.userId) {
						this.joined = true;
					}
				}
			});
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
					'og:site_name': 'Peerbuds',
					'og:description': this.scholarship.description
				}
			})
		}, function (response) {
			console.log('response is ', response);
		});
	}
}
