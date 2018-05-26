import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MediaMatcher } from '@angular/cdk/layout';
import { SocialSharingService } from '../_services/social-sharing/social-sharing.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { FormControl } from '@angular/forms';
import { MatStepper, MatSnackBar } from '@angular/material';
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
	searchForm: FormControl;
	contacts: Array<any>;
	originalContacts: Array<any>;
	@ViewChild('stepper') public myStepper: MatStepper;
	selectedIndex: number;
	checkedCount: number;

	constructor(
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private media: MediaMatcher,
		public cd: ChangeDetectorRef,
		private socialSharingService: SocialSharingService,
		private cookieUtilsService: CookieUtilsService,
		private matSnackBar: MatSnackBar
	) {
		this.envVariable = environment;
	}

	ngOnInit() {
		this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
		this._mobileQueryListener = () => this.cd.detectChanges();
		this.mobileQuery.addListener(this._mobileQueryListener);
		this.userId = this.cookieUtilsService.getValue('userId');
		this.currentPath = this.router.url.slice(1);
		this.setTags();
		this.getContacts();
		this.setupForm();
		this.selectedIndex = 0;
		this.checkedCount = 0;
		this.activatedRoute.params.subscribe(params => {
			if (params['stepId']) {
				console.log('stepId' + params['stepId']);
				this.selectedIndex = Number(params['stepId']);
			}
		});
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

	private setTags() {
		this.titleService.setTitle('Invite friends');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Invite your friends to peerbuds'
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
			this.router.navigate(['onboarding', '1']);

			this.matSnackBar.open('Peers invited', 'Close', { duration: 3000 });
		}, err => {
			this.matSnackBar.open('Error', 'Close', { duration: 3000 });
		});
	}

	public next() {
		const step = this.myStepper.selectedIndex;
		switch (step) {
			case 2:
				this.sendInvites();
				break;
			default:
				break;
		}
		this.myStepper.next();
	}

	public previous() {
		this.myStepper.previous();
	}

	public selectionChanged(event) {
		console.log(event);
		this.selectedIndex = event.selectedIndex;
	}

	public count(event) {
		console.log(event);
		this.checkedCount = this.contacts.filter((contact) => contact.selected).length;
	}
}

interface PeerInvite {
	name: string;
	email: string;
	peerId: string;
	status: string;
	contactId: string;
}
