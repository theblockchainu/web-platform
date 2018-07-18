import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';
import {Meta, Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {DialogsService} from '../../_services/dialogs/dialog.service';

@Component({
	selector: 'app-class-intro',
	templateUrl: './class-intro.component.html',
	styleUrls: ['./class-intro.component.scss']
})
export class ClassIntroComponent implements OnInit {
	
	constructor(
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		private dialogsService: DialogsService
	) { }
	
	ngOnInit() {
		this.setTags();
	}
	
	private setTags() {
		this.titleService.setTitle('Classes');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds Classes'
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
	
	public openLogin() {
		this.dialogsService.openLogin().subscribe();
	}
	
}
