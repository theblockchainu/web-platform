import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';

@Component({
	selector: 'app-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	public loadingHome = false;
	private email: string;
	notifyForm: FormGroup;
	public loggedIn = false;
	constructor(
		private authenticationService: AuthenticationService,
		public _fb: FormBuilder,
		private _router: Router,
		public dialog: MatDialog,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private titleService: Title,
		private metaService: Meta,
		private dialogsService: DialogsService,
		private _activatedRoute: ActivatedRoute) {
		authenticationService.isLoggedIn().subscribe((res) => {
			this.loggedIn = res;
			if (this.loggedIn) {
				this._router.navigate(['home', 'homefeed']);
			}
		});
		_activatedRoute.url.subscribe(res => {
			if (res[0] && res[0].path === 'login') {
				if (!this.loggedIn) {
					this.dialogsService.openLogin().subscribe();
				}
			}
		});
	}
	ngOnInit() {
		this.loadingHome = false;
		this.notifyForm = this._fb.group(
			{ email: ['', [Validators.requiredTrue, Validators.email]] }
		);
		this.setTags();
	}
	public openVideo() {
		const url = '/assets/video/homepageExplainer.mp4';
		this.dialogsService.openVideo(url).subscribe();
	}
	public sendEmailSubscriptions() {
		if (this.notifyForm.valid) {
			this.email = this.notifyForm.controls['email'].value;
			this.authenticationService.sendEmailSubscriptions(this.email)
				.subscribe(
				);
			this.snackBar.open('We have registered your email for all our future updates leading to the official Karma launch later this year', 'Thanks', {
				duration: 5000
			});
		} else {
			this.snackBar.open('Please enter a valid email address', 'Ok', {
				duration: 5000
			});
		}
	}

	public openSignup() {
		// window.location.href = environment.clientUrl + '/signup.html';
		this._router.navigate(['sign-up']);
	}

	public openTelegram() {
		window.location.href = 'https://t.me/peerbuds';
	}

	private setTags() {
		this.titleService.setTitle('Peerbuds');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds'
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
			content: environment.clientUrl + this._router.url
		});
	}
}
