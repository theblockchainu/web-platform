import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { ProfileService } from '../../_services/profile/profile.service';

@Component({
	selector: 'app-peer-intro',
	templateUrl: './peer-intro.component.html',
	styleUrls: ['./peer-intro.component.scss']
})
export class PeerIntroComponent implements OnInit {
	public userId;
	public accountVerified: boolean;
	isLoggedIn: Observable<boolean>;
	public profile: any;
	public isEmailVerified: boolean;
	public isTeacher: boolean;
	public envVariable;

	constructor(
		public authService: AuthenticationService,
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		private dialogsService: DialogsService,
		public _collectionService: CollectionService,
		private _cookieUtilsService: CookieUtilsService,
		private matSnackBar: MatSnackBar,
		public _profileService: ProfileService,
	) { }

	ngOnInit() {
		this.isLoggedIn = this.authService.isLoginSubject.asObservable();
		this.setTags();
		this.fetchData();
		this.envVariable = environment;
	}

	fetchData() {
		this.userId = this._cookieUtilsService.getValue('userId');
		this.accountVerified = (this._cookieUtilsService.getValue('accountApproved') === 'true');
		this.getProfile();
	}

	getProfile() {
		this.isLoggedIn.subscribe(loggedIn => {
			if (loggedIn) {
				this._profileService.getCompactProfile(this.userId).subscribe((profile: any) => {
					if (profile && profile.length > 0) {
						this.profile = profile[0];
						this.isEmailVerified = this.profile.peer[0].emailVerified;
						if (this.profile.peer[0].ownedCollections !== undefined && this.profile.peer[0].ownedCollections.length > 0) {
							this.isTeacher = true;
						}
					}
				});
			} else {
				return null;
			}
		});
	}
	private setTags() {
		this.titleService.setTitle('Sessions');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'The Blockchain University Sessions'
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

	public openLogin() {
		this.dialogsService.openLogin().subscribe(res => {
			if (res) {
				this.fetchData();
			}
		});
	}

	public openSignup() {
		this.dialogsService.openSignup('/console/teaching/sessions').subscribe();
	}

	/**
	* createSession
	*/
	public createSession() {
		if (this.userId && this.userId.length > 5 && this.accountVerified) {
			this.submitSession();
		} else if (!this.userId || this.userId.length < 5) {
			/*this.dialogsService.openLogin().subscribe(res => {
				if (res) {
					this.fetchData();
					this.createSession();
				}
			});*/
			this.openSignup();
		} else if (!this.accountVerified) {
			this.matSnackBar.open('Account not yet verified. Please wait while your account is being verified', 'Close', {
				duration: 3000
			});
		} else {
			console.log('Error');
		}
	}

	private submitSession() {
		this._collectionService.postCollection(this.userId, 'session').subscribe((sessionObject: any) => {
			this.router.navigate(['session', sessionObject.id, 'edit', 1]);
		});
	}

	public goToHome() {
		if (this.isLoggedIn) {
			this.router.navigate(['home', 'homefeed']);
		} else {
			this.router.navigate(['/']);
		}
	}

}
