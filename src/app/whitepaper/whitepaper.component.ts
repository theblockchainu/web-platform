import { Component, OnInit } from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

@Component({
	selector: 'app-whitepaper',
	templateUrl: './whitepaper.component.html',
	styleUrls: ['./whitepaper.component.scss']
})
export class WhitepaperComponent implements OnInit {
	
	pdfSrc = '../assets/files/peerbudsWhitepaper.pdf';
	public envVariable;
	constructor(
		private titleService: Title,
		private metaService: Meta,
		private router: Router
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		this.setTags();
		
	}
	
	private setTags() {
		this.titleService.setTitle('White Paper');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds White Paper'
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
