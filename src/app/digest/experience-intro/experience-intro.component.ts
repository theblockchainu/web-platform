import { Component, OnInit } from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';

@Component({
	selector: 'app-experience-intro',
	templateUrl: './experience-intro.component.html',
	styleUrls: ['./experience-intro.component.scss']
})
export class ExperienceIntroComponent implements OnInit {
	
	constructor(
		private titleService: Title,
		private metaService: Meta,
		private router: Router
	) { }
	
	ngOnInit() {
		this.setTags();
	}
	
	private setTags() {
		this.titleService.setTitle('Experiences');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds Experiences'
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
	
}
