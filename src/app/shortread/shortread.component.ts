import { Component, OnInit } from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

@Component({
	selector: 'app-shortread',
	templateUrl: './shortread.component.html',
	styleUrls: ['./shortread.component.scss']
})
export class ShortreadComponent implements OnInit {
	
	pdfSrc = '../assets/files/peerbudsShortread.pdf';
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
		this.titleService.setTitle('Short Read');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds Short Read'
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
