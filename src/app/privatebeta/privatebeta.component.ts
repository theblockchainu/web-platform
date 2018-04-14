import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {Meta, Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

@Component({
	selector: 'app-privatebeta',
	templateUrl: './privatebeta.component.html',
	styleUrls: ['./privatebeta.component.scss']
})
export class PrivatebetaComponent implements OnInit {
	
	constructor(
		private titleService: Title,
		private metaService: Meta,
		private router: Router
	) { }
	
	ngOnInit() {
		this.setTags();
	}
	
	private setTags() {
		this.titleService.setTitle('Private Beta');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds Private Beta'
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
	
	public openCalendly() {
		window.location.href = 'https://calendly.com/peerbuds/15min';
	}
	
}
