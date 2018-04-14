import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import {Meta, Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

@Component({
	selector: 'app-contact-us',
	templateUrl: './contact-us.component.html',
	styleUrls: ['./contact-us.component.scss']
})

export class ContactComponent implements OnInit {
	private first_name: string;
	private last_name: string;
	private email: string;
	private subject: string;
	private message: string;
	contactUsForm: FormGroup;
	
	lat = 37.508772;
	lng = -121.960507;
	
	constructor(public _fb: FormBuilder,
				private authenticationService: AuthenticationService,
				private titleService: Title,
				private metaService: Meta,
				private router: Router
	) {
	}
	
	ngOnInit() {
		this.contactUsForm = this._fb.group(
			{
				first_name: ['', Validators.required],
				last_name: ['', Validators.required],
				email: ['', Validators.requiredTrue],
				subject: ['', Validators.required],
				message: ['', Validators.required]
			}
		);
		this.setTags();
	}
	public createGuestContacts() {
		// this.loading = true;
		this.first_name = this.contactUsForm.controls['first_name'].value;
		this.last_name = this.contactUsForm.controls['last_name'].value;
		this.email = this.contactUsForm.controls['email'].value;
		this.subject = this.contactUsForm.controls['subject'].value;
		this.message = this.contactUsForm.controls['message'].value;
		this.authenticationService.createGuestContacts(this.first_name, this.last_name, this.email, this.subject, this.message)
			.subscribe();
	}
	
	private setTags() {
		this.titleService.setTitle('Contact Us');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds Contact Information'
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
