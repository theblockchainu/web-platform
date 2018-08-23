import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../_services/collection/collection.service';
import { ProfileService } from '../_services/profile/profile.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {environment} from '../../environments/environment';
import {Meta, Title} from '@angular/platform-browser';

@Component({
	templateUrl: './console.component.html',
	styleUrls: ['./console.component.scss'],
	animations: [
		trigger('slideInOut', [
			state('in', style({
				transform: 'translate3d(0, 0, 0)'
			})),
			state('out', style({
				transform: 'translate3d(100%, 0, 0)'
			})),
			transition('in => out', animate('400ms ease-in-out')),
			transition('out => in', animate('400ms ease-in-out'))
		]),
	]
})
export class ConsoleComponent implements OnInit {
	
	public activeTab: string;
	public userId;
	public isAdmin: boolean;
	
	constructor(public router: Router,
				private activatedRoute: ActivatedRoute,
				private cookieUtilsService: CookieUtilsService,
				private _collectionService: CollectionService,
				public _profileService: ProfileService,
				private titleService: Title,
				private metaService: Meta,
				private _cookieUtilsService: CookieUtilsService) {
		this.activatedRoute.firstChild.url.subscribe((urlSegment) => {
			console.log('activated route is: ' + JSON.stringify(urlSegment));
			this.activeTab = urlSegment[0].path;
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this._profileService.getPeerData(this.userId).subscribe(
			(result: any) => {
				if (result) {
					this.isAdmin = result.isAdmin;
					this.setTags();
				} else {
					this.router.navigate(['/home/homefeed']);
				}
			}, err => {
				console.log(err);
			}
		);
	}
	
	/**
	 * Check if the given tab is active tab
	 * @param tabName
	 * @returns {boolean}
	 */
	public getActiveTab() {
		return this.activeTab;
	}
	
	/**
	 * Set active tab
	 * @param value
	 */
	public setActiveTab(value) {
		this.activeTab = value;
	}
	
	private setTags() {
		this.titleService.setTitle('Console');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Management Console'
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
}
