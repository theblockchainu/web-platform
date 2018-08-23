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
			content: 'The Blockchain University White Paper'
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
	
}
