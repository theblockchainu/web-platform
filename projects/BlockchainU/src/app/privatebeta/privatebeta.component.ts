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
			content: 'The Blockchain University Private Beta'
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'theblockchainu.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: 'https://theblockchainu.com/bu_logo_square.png'
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
