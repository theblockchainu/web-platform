import {Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import {environment} from '../../../environments/environment';

@Component({
	selector: 'app-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	public loadingHome = false;
	private email: string;
	notifyForm: FormGroup;
	public isLoggedIn;
	public loggedIn = false;
	constructor(
		private authenticationService: AuthenticationService,
		public _fb: FormBuilder,
		private _router: Router,
		public dialog: MatDialog,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private dialogsService: DialogsService,
		private _activatedRoute: ActivatedRoute) {
		this.isLoggedIn = authenticationService.isLoggedIn();
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
				} else {
					// this._router.navigate(['home', 'homefeed']);
				}
			}
		});
	}
	ngOnInit() {
		this.loadingHome = false;
		this.notifyForm = this._fb.group(
			{ email: ['', Validators.requiredTrue] }
		);
	}
	public openVideo() {
		const url = '/assets/video/homepageExplainer.mp4';
		this.dialogsService.openVideo(url).subscribe();
	}
	public sendEmailSubscriptions(message: string, action: string) {
		// this.loading = true;
		this.email = this.notifyForm.controls['email'].value;
		this.authenticationService.sendEmailSubscriptions(this.email)
			.subscribe(
				// (response) => {this.snackBar.open('Email Subscribed', 'OK'); });
			);
		this.snackBar.open('We have registered your email for all our future updates leading to the official Karma launch later this year', 'Thanks', {
			duration: 5000
		});
	}
	
	public openSignup() {
		window.location.href = environment.clientUrl + '/signup.html';
	}
}
