import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
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
				this._profileService.getCompactProfile(this.userId).subscribe(profile => {
					if (profile && profile.length > 0) {
						this.profile = profile[0];
						this.isEmailVerified = this.profile.peer[0].emailVerified;
						if (this.profile.peer[0].ownedCollections !== undefined && this.profile.peer[0].ownedCollections.length > 0) {
							this.isTeacher = true;
						}
						// if (this.router.url !== '/signup-social' && this.router.url !== '/verification/1' && this.profile.peer[0].identities && this.profile.peer[0].identities.length > 0 && (!this.profile.peer[0].phoneVerified || !this.profile.peer[0].emailVerified)) {
						// 	// Incomplete Social signup. Redirect user to finish it.
						// 	this.router.navigate(['signup-social']);
						// 	this.snackBar.open('We need just a few more details before continuing. Redirecting you to finish signup...', 'OK', {
						// 		duration: 5000
						// 	});
						// } else if (this.router.url !== '/verification/1' && (!this.profile.peer[0].identities || this.profile.peer[0].identities.length === 0) && (!this.profile.peer[0].phoneVerified || !this.profile.peer[0].emailVerified)) {
						// 	this.router.navigate(['verification', '1']);
						// 	this.snackBar.open('We need just a few more details before continuing. Redirecting you to finish signup...', 'OK', {
						// 		duration: 5000
						// 	});
						// }
					}
				});
			} else {
				return null;
			}
		});
	}
	private setTags() {
		this.titleService.setTitle('Sessiones');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds Sessiones'
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
		this.dialogsService.openLogin().subscribe(res => {
			if (res) {
				this.fetchData();
			}
		});
	}

	/**
	* createSession
	*/
	public createSession() {
		if (this.userId && this.userId.length > 5 && this.accountVerified) {
			this.submitSession();
		} else if (!this.userId || this.userId.length < 5) {
			this.dialogsService.openLogin().subscribe(res => {
				if (res) {
					this.fetchData();
					this.createSession();
				}
			});
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

}
