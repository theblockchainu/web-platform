import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import {environment} from '../../environments/environment';
import {ProfileService} from '../_services/profile/profile.service';
import {Meta, Title} from '@angular/platform-browser';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	
	public activeTab = '';
	public loadingPeerData = false;
	public loggedInPeer;
	public userId;
	public profileCompletionObject;
	public envVariable;
	public totalVerifySteps = 2;
	public completeVerifySteps = 0;
	public socialConnections = {
		google: false,
		fb: false,
		linkedin: false
	};
	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute,
		private _profileService: ProfileService,
		private metaService: Meta,
		private titleService: Title,
		private _cookieUtilsService: CookieUtilsService
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		if (this.activatedRoute.firstChild) {
			this.activatedRoute.firstChild.url.subscribe((urlSegment) => {
				console.log('activated route is: ' + JSON.stringify(urlSegment));
				this.activeTab = urlSegment[0].path;
			});
		} else {
			this.activeTab = '';
		}
		this.router.events.subscribe(event => this.updateActiveLink(event));
		this.fetchPeerData();
	}
	
	private fetchPeerData() {
		this.loadingPeerData = true;
		const filter = {
			include: [
				'profiles',
				'identities',
				'credentials'
			]
		};
		this._profileService.getPeerData(this.userId, filter).subscribe(res => {
			this.loggedInPeer = res;
			if (this.loggedInPeer) {
				this.setTags();
				if (this.loggedInPeer.accountVerified) {
					this.completeVerifySteps++;
				}
				if (this.loggedInPeer.identities && this.loggedInPeer.identities.length > 0) {
					if (this.loggedInPeer.identities.find(identity => identity.provider === 'google')) {
						this.socialConnections.google = true;
					}
					if (this.loggedInPeer.identities.find(identity => identity.provider === 'facebook')) {
						this.socialConnections.fb = true;
					}
					if (this.loggedInPeer.identities.find(identity => identity.provider === 'linkedin')) {
						this.socialConnections.linkedin = true;
					}
				}
				const profileObject = this.loggedInPeer.profiles[0];
				profileObject.peer = [];
				profileObject.peer.push(this.loggedInPeer);
				this.profileCompletionObject = this._profileService.getProfileProgressObject(profileObject);
				if (this.profileCompletionObject.progress === 100) {
					this.completeVerifySteps++;
				}
			}
			this.loadingPeerData = false;
			
		}, err => {
			console.log(err);
		});
	}
	
	private setTags() {
		this.titleService.setTitle('Hello ' + this.loggedInPeer.profiles[0].first_name + '!');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Welcome to Peerbuds'
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: 'Peerbuds is an open decentralized protocol that tracks everything you have ever learned in units called Gyan and rewards it with tokens called Karma.'
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'peerbuds.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: 'https://peerbuds.com/pb_logo_square.png'
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}
	
	public updateActiveLink(location) {
		if (location !== undefined && location.url !== undefined && location.url.split('/').length >= 3) {
			this.activeTab = location.url.split('/')[location.url.split('/').length - 1];
		} else {
			this.activeTab = '';
		}
	}
	
	public closeHome() {
		this._cookieUtilsService.setValue('dismissHome', 'true');
		this.router.navigate(['home', 'homefeed']);
	}
	
}
