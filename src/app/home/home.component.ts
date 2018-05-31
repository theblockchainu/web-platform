import { Component, OnInit } from '@angular/core';
import { Router, Params, NavigationStart, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import {environment} from '../../environments/environment';
import {ProfileService} from '../_services/profile/profile.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	
	public activeTab = 'homefeed';
	public loadingPeerData = false;
	public loggedInPeer;
	public userId;
	public profileCompletionObject;
	public envVariable;
	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute,
		private _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.activatedRoute.firstChild.url.subscribe((urlSegment) => {
			console.log('activated route is: ' + JSON.stringify(urlSegment));
			this.activeTab = urlSegment[0].path;
		});
		this.router.events.subscribe(event => this.updateActiveLink(event));
		this.fetchPeerData();
	}
	
	private fetchPeerData() {
		this.loadingPeerData = true;
		const filter = {
			include: [
				'profiles'
			]
		};
		this._profileService.getPeerData(this.userId, filter).subscribe(res => {
			this.loggedInPeer = res;
			this.loadingPeerData = false;
			const profileObject = this.loggedInPeer.profiles[0];
			profileObject.peer = [];
			profileObject.peer.push(this.loggedInPeer);
			this.profileCompletionObject = this._profileService.getProfileProgressObject(profileObject);
		}, err => {
			console.log(err);
		});
	}
	
	public updateActiveLink(location) {
		if (location !== undefined && location.url !== undefined) {
			this.activeTab = location.url.split('/')[location.url.split('/').length - 1];
		}
	}
	
}
