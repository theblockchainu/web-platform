import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
	selector: 'app-whitepaper',
	templateUrl: './whitepaper.component.html',
	styleUrls: ['./whitepaper.component.scss']
})
export class WhitepaperComponent implements OnInit {

	pdfSrc = '/assets/files/whitepaper.pdf';
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
		this.titleService.setTitle('Blockchain developer in Mumbai, Pune, Hyderabad');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Blockchain developer in Mumbai, Pune, Hyderabad'
		});
		this.metaService.updateTag({
			property: 'description',
			content: 'With over 1500 developers, we are one of the largest certified blockchain community in the world and work with most leading blockchain companies including Consensys, AIKON, Digital Asset, EOS etc. as official community, certification and education partners'
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
