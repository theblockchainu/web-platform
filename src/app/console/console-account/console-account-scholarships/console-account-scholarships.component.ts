import { Component, OnInit } from '@angular/core';
import { ConsoleAccountComponent } from '../console-account.component';
import { ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ScholarshipService } from '../../../_services/scholarship/scholarship.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
@Component({
	selector: 'app-console-account-scholarships',
	templateUrl: './console-account-scholarships.component.html',
	styleUrls: ['./console-account-scholarships.component.scss']
})
export class ConsoleAccountScholarshipsComponent implements OnInit {
	
	private userId: string;
	public scholarshipsLoaded: boolean;
	public scholarships: Array<any>;
	public hostedScholarshipsLoaded: boolean;
	public hostedScholarships: Array<any>;
	constructor(
		public consoleAccountComponent: ConsoleAccountComponent,
		public activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService,
		private _scholarshipService: ScholarshipService,
		private _dialogsService: DialogsService,
		private _matSnackBar: MatSnackBar
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleAccountComponent.setActiveTab(urlSegment[0].path);
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.fetchScholarships();
		this.fetchHostedScholarships();
	}
	
	private fetchHostedScholarships() {
		const filter = { 'include': [{ 'owner': 'profiles' }, 'peers_joined', 'allowed_collections'] };
		this._scholarshipService.fetchUserHostedScholarships(filter).subscribe((res: any) => {
			console.log('hosted Scholarships');
			console.log(res);
			this.hostedScholarships = res;
			this.hostedScholarshipsLoaded = true;
		}, err => {
			this.hostedScholarshipsLoaded = true;
		});
	}
	
	private fetchScholarships() {
		const filter = { 'include': [{ 'owner': 'profiles' }, 'peers_joined', 'allowed_collections'] };
		this._scholarshipService.fetchUserScholarships(filter)
			.subscribe((res: any) => {
				this.scholarships = res;
				this.scholarshipsLoaded = true;
				console.log(this.scholarships);
		}, err => {
			this.scholarshipsLoaded = true;
		});
	}
	
	/**
	 * hostScholarship
	 */
	public hostScholarship() {
		const selectedCollections = [];
		this._dialogsService.createScholarshipDialog({
			type: 'private'
		})
			.flatMap(res => {
				if (res) {
					res.selectedCollections.forEach(collection => {
						selectedCollections.push(collection.id);
					});
					return this._scholarshipService.createScholarship(res.scholarshipForm);
				}
			})
			.flatMap((res: any) => {
				if (selectedCollections.length > 0) {
					return this._scholarshipService.connectCollections(res.id, selectedCollections);
				} else {
					this._matSnackBar.open('Successfully created new scholarship', 'Close', { duration: 5000 });
					this.fetchHostedScholarships();
				}
			})
			.subscribe(res => {
				this._matSnackBar.open('Successfully created new scholarship', 'Close', { duration: 5000 });
				this.fetchHostedScholarships();
			});
	}
	
	/**
	 * deleteScholarship
	 */
	public deleteScholarship(id: string) {
		this._scholarshipService.deleteScholarship(id).subscribe(res => {
			this._matSnackBar.open('Deleted', 'close', {
				duration: 5000
			});
			this.fetchHostedScholarships();
		});
	}
	
	/**
	 * leaveScholarship
	 id:string   */
	public leaveScholarship(id: string) {
		this._scholarshipService.leaveScholarship(this.userId, id).subscribe(res => {
			this._matSnackBar.open('Left', 'close', {
				duration: 5000
			});
			this.fetchScholarships();
		});
	}
	
}
