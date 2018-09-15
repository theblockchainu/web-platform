import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MediaMatcher } from '@angular/cdk/layout';
import { SocialSharingService } from '../_services/social-sharing/social-sharing.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { FormControl } from '@angular/forms';
import { MatStepper, MatSnackBar } from '@angular/material';
import { ProfileService } from '../_services/profile/profile.service';
import { DialogsService } from '../_services/dialogs/dialog.service';
import {CollectionService} from '../_services/collection/collection.service';
declare let FB: any;
@Component({
	selector: 'app-invite',
	templateUrl: './invite.component.html',
	styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
	
	initialised = false;
	provider: string;
	public mobileQuery: MediaQueryList;
	private _mobileQueryListener: () => void;
	selectedPlatform: number;
	userId: string;
	envVariable: any;
	currentPath: string;
	public userIdentities = [];
	public userCredentials = [];
	searchForm: FormControl;
	public contacts = [];
	originalContacts: Array<any>;
	@ViewChild('stepper') public myStepper: MatStepper;
	public selectedIndex = 1;
	checkedCount: number;
	public inviteLink = '';
	public emailVerified = false;

	constructor(
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private media: MediaMatcher,
		public cd: ChangeDetectorRef,
		private socialSharingService: SocialSharingService,
		private _dialogsService: DialogsService,
		private cookieUtilsService: CookieUtilsService,
		private matSnackBar: MatSnackBar,
		private _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		public _collectionService: CollectionService
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
		this.inviteLink = environment.clientUrl + '/sign-up/' + this.userId;
	}

	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			this.selectedIndex = Number(params['stepId']);
		});
		this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
		this._mobileQueryListener = () => this.cd.detectChanges();
		this.mobileQuery.addListener(this._mobileQueryListener);
		this.userId = this.cookieUtilsService.getValue('userId');
		this.currentPath = this.router.url.slice(1);
		this.showOnboardingDialog();
		this.setTags();
		this.getContacts();
		this.setupForm();
		this.checkedCount = 0;
	}

	private setupForm() {
		this.searchForm = new FormControl('');
		this.searchForm.valueChanges.subscribe(res => {
			console.log(res);
			this.contacts = this.originalContacts.filter((contact) => {
				return contact.name.toLowerCase().includes(res.toLowerCase());
			});
		});
	}

	private getContacts() {
		this.originalContacts = [];
		this.socialSharingService.getUserContacts(this.userId).subscribe((res: any) => {
			res.forEach(element => {
				element.selected = false;
				this.originalContacts.push(element);
			});
			this.originalContacts.sort((a, b) => {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			console.log(this.originalContacts);
			this.contacts = this.originalContacts;
		});
	}

	public deleteContact(contact, index) {
		this.socialSharingService.deleteContact(contact.id).subscribe(res => {
			this.matSnackBar.open('Contact has been deleted.', 'Ok', { duration: 5000 });
			this.originalContacts.splice(index, 1);
		}, err => {
			this.matSnackBar.open('Error Occurred.', 'Ok', { duration: 5000 });
		});
	}

	private setTags() {
		this.titleService.setTitle('Invite friends');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Build your Knowledge Story - Join The Blockchain University!'
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
	
	showOnboardingDialog() {
		const filter = {
			include: ['identities', 'credentials']
		};
		this._profileService.getPeerData(this.userId, filter).subscribe((peer: any) => {
			if (peer) {
				this.emailVerified = peer.emailVerified;
				this.userIdentities = peer.identities;
				this.userCredentials = peer.credentials;
				if (!this.emailVerified && this.selectedIndex === 1) {
					this._dialogsService.openOnboardingDialog(true).subscribe((result: any) => {
						// do nothing
					});
				}
			}
		});
	}

	sendInvites() {
		const selectedPeers: Array<PeerInvite> = [];
		this.contacts.forEach(contact => {
			if (contact.selected) {
				selectedPeers.push({
					email: contact.email,
					name: contact.name,
					peerId: this.userId,
					status: 'pending',
					contactId: contact.id
				});
			}
		});
		this.socialSharingService.inviteContacts(this.userId, selectedPeers).subscribe(res => {
			this.router.navigate(['home', 'homefeed']);

			this.matSnackBar.open('Your invitation has been sent to all selected contacts.', 'Close', { duration: 3000 });
		}, err => {
			this.matSnackBar.open('Error', 'Close', { duration: 5000 });
		});
	}

	public next() {
		const step = this.myStepper.selectedIndex + 1;
		switch (step) {
			case 3:
				this.sendInvites();
				break;
			default:
				break;
		}
		this.myStepper.next();
		this.router.navigate(['invite', this.myStepper.selectedIndex + 1]);
	}

	public previous() {
		this.myStepper.previous();
		this.router.navigate(['invite', this.myStepper.selectedIndex + 1]);
	}

	public selectionChanged(event) {
		console.log(event);
		this.selectedIndex = event.selectedIndex + 1;
	}

	public count(event) {
		console.log(event);
		this.checkedCount = this.contacts.filter((contact) => contact.selected).length;
	}

	public selectAllClicked(event) {
		if (event.checked) {
			this.contacts.forEach(contact => {
				contact.selected = true;
			});
		} else {
			this.contacts.forEach(contact => {
				contact.selected = false;
			});
		}
		this.count(event);
	}

	public continueWithGoogle() {
		let hasIdentity = false;
		this.userIdentities.forEach(identity => {
			if (identity.provider && identity.provider === 'google') {
				hasIdentity = true;
			}
		});
		if (hasIdentity) {
			this.router.navigate(['invite', '2']);
		} else {
			location.href = environment.apiUrl + '/auth/google?returnTo=invite/2';
		}
	}

	public continueWithFacebook() {
		let hasIdentity = false;
		this.userIdentities.forEach(identity => {
			if (identity.provider && identity.provider === 'facebook') {
				hasIdentity = true;
			}
		});
		if (hasIdentity) {
			this.router.navigate(['invite', '2']);
		} else {
			location.href = environment.apiUrl + '/auth/facebook?returnTo=invite/2';
		}
	}

	public continueWithLinkedin() {
		let hasIdentity = false;
		this.userIdentities.forEach(identity => {
			if (identity.provider && identity.provider === 'linkedin') {
				hasIdentity = true;
			}
		});
		if (hasIdentity) {
			this.router.navigate(['invite', '2']);
		} else {
			location.href = environment.apiUrl + '/auth/linkedin?returnTo=invite/2';
		}
	}

	public onCopySuccess() {
		this.matSnackBar.open('Copied to clipboard', 'Close', {
			duration: 5000
		});
	}

	public closeInvite() {
		this.router.navigate(['home', 'homefeed']);
	}
}

interface PeerInvite {
	name: string;
	email: string;
	peerId: string;
	status: string;
	contactId: string;
}
