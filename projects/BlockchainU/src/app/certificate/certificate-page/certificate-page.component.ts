import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CertificateService } from '../../_services/certificate/certificate.service';
import { MatSnackBar } from '@angular/material';
import { CollectionService } from '../../_services/collection/collection.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { ProfileService } from '../../_services/profile/profile.service';
import { AccreditationService } from '../../_services/accreditation/accreditation.service';
import { Title, Meta } from '@angular/platform-browser';
import { UcWordsPipe } from 'ngx-pipes';

@Component({
	selector: 'app-certificate-page',
	templateUrl: './certificate-page.component.html',
	styleUrls: ['./certificate-page.component.scss']
})
export class CertificatePageComponent implements OnInit {
	
	certificate: any;
	initialised: boolean;
	certificateId: string;
	userId: string;
	collection: any;
	loadingCollection = true;
	accountApproved: string;
	loadingCertificate: boolean;
	certificateHTML: string;
	downloadJsonHref: any;
	envVariable: any;
	issuer: any;
	recipient: any;
	accreditation: any;
	assessment: any;
	verified: boolean;
	
	constructor(
		private activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService,
		private router: Router,
		private dialogsService: DialogsService,
		private matSnackBar: MatSnackBar,
		private certificateService: CertificateService,
		private collectionService: CollectionService,
		private sanitizer: DomSanitizer,
		private profileService: ProfileService,
		private accreditationService: AccreditationService,
		private titleService: Title,
		private metaService: Meta,
		private ucwords: UcWordsPipe
	
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			if (this.initialised && (this.certificateId !== params['certificateId'])) {
				location.reload();
			}
			this.certificateId = params['certificateId'];
		});
		this.userId = this._cookieUtilsService.getValue('userId');
		this.initialised = true;
		this.initializePage();
		this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
	}
	
	initializePage() {
		this.certificateService.getCertificate(this.certificateId).subscribe((res: any) => {
			this.certificate = JSON.parse(res.stringifiedJSON);
			this.loadingCertificate = false;
			console.log(this.certificate);
			this.generateDownloadJsonUri();
			this.getProfileData();
			this.getCollection();
			this.setTags();
		});
	}
	
	getCollection() {
		this.loadingCollection = true;
		const filter = {
			include: ['owners', 'participants']
		};
		this.collectionService.getCollectionDetail(this.certificate.collection.id, filter)
			.subscribe(res => {
				this.collection = res;
				this.loadingCollection = false;
			});
	}
	
	getProfileData() {
		let filter = {
			'include': [{ 'profiles': ['work'] }, { 'accreditationsSubscribed': [{ 'createdBy': { 'profiles': ['work'] } }, 'topics'] }]
		};
		this.profileService.getPeerData(this.certificate.issuer.id, filter).subscribe(res => {
			this.issuer = res;
			this.accreditation = res.accreditationsSubscribed[0];
			console.log(res);
		});
		filter = {
			'include': [{ 'profiles': ['work'] }]
		};
		this.profileService.getPeerData(this.certificate.recipient.id, filter).subscribe(res => {
			this.recipient = res;
		});
	}
	
	verify() {
		this.dialogsService.verifyCertificateDialog(this.certificate).subscribe(res => {
			this.verified = res;
		});
	}
	
	share() {
		this.dialogsService.shareCollection('certificate', this.certificateId, this.certificate.collection.title, 'Certificate for ' + this.certificate.collection.title, '', environment.apiUrl + this.certificate.collection.imageUrls[0]).subscribe(res => {
			console.log(res);
		});
	}
	
	generateDownloadJsonUri() {
		const theJSON = JSON.stringify(this.certificate);
		const uri = this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(theJSON));
		this.downloadJsonHref = uri;
	}
	
	private setTags() {
		this.titleService.setTitle('Certificate:' + this.ucwords.transform(this.certificate.recipient.profile.first_name));
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Certificate:' + this.ucwords.transform(this.certificate.recipient.profile.first_name)
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: this.certificate.collection.description
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'theblockchainu.com'
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}
	
}
