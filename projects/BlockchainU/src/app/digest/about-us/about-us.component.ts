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
	selector: 'app-about-us',
	templateUrl: './about-us.component.html',
	styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
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
		this.titleService.setTitle('Blockchain courses in Mumbai, Bangalore');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Blockchain courses in Mumbai, Bangalore'
		});
		this.metaService.updateTag({
			property: 'description',
			content: 'Our students learn to build applications and solutions that matter. More importantly, we help them vet out their products for the market, and give them our industry resources to succeed'
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
		this.dialogsService.openLogin().subscribe();
	}
	
	public openSignup() {
		this.dialogsService.openSignup('/console/teaching/classes').subscribe();
	}
	
	public goToHome() {
		if (this.userId && this.userId.length > 5) {
			this.router.navigate(['home', 'homefeed']);
		} else {
			this.router.navigate(['/']);
		}
	}
	
	public openBlog() {
		window.location.href = 'https://medium.com/theblockchainu';
	}
	
}
