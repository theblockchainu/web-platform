import {Component, OnInit, Inject, ViewChild, ElementRef} from '@angular/core';
import { SearchService } from '../../search/search.service';
import { environment } from '../../../../environments/environment';
import { CollectionService } from '../../collection/collection.service';
import {MAT_DIALOG_DATA, MatSnackBar, MatDialogRef, MatChipInputEvent} from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import * as _ from 'lodash';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CookieUtilsService} from '../../cookieUtils/cookie-utils.service';
import {SocialSharingService} from '../../social-sharing/social-sharing.service';
import * as XLSX from 'xlsx';

@Component({
	selector: 'app-add-participant-dialog',
	templateUrl: './add-participant-dialog.component.html',
	styleUrls: ['./add-participant-dialog.component.scss']
})
export class AddParticipantDialogComponent implements OnInit {

	public peerId: string;
	public selectedPeers: Array<PeerObject>;
	public selectedInvites: Array<any>;
	public searchOptions: Array<any>;
	public httpLoading = false;
	public envVariable: any;
	public selectedChips: Array<any>;
	public searchForm: FormGroup;
	public excelData: any;
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];
	@ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

	constructor(private _searchService: SearchService,
				@Inject(MAT_DIALOG_DATA) public data: any,
				public _collectionService: CollectionService,
				private _cookieUtilsService: CookieUtilsService,
				private _socialSharingService: SocialSharingService,
				private _fb: FormBuilder,
				private matSnackBar: MatSnackBar,
				public dialogRef: MatDialogRef<AddParticipantDialogComponent>,
	) {
		this.envVariable = environment;
	}

	ngOnInit() {
		this.peerId = this._cookieUtilsService.getValue('userId');
		this.selectedPeers = [];
		this.selectedInvites = [];
		this.selectedChips = [];
		this.searchForm = this._fb.group({
			searchText: ['', Validators.required]
		});
	}

	removePeer(peer: any): void {
		if (!peer.email) {
			const index = _.findIndex(this.selectedPeers, (o) => o.id === peer.id);
			if (index >= 0) {
				this.selectedPeers.splice(index, 1);
			}
		} else {
			const index = _.findIndex(this.selectedInvites, (o) => o.email === peer.email);
			if (index >= 0) {
				this.selectedInvites.splice(index, 1);
			}
		}
		this.selectedChips = _.union(this.selectedPeers, this.selectedInvites);
	}

	onSearchOptionClicked(data: any): void {
		console.log(data);
		this.selectedPeers.push(
			{
				id: data.id,
				name: data.profiles[0].first_name + ' ' + data.profiles[0].last_name,
				scholarshipId: data.scholarships_joined[0].id
			}
		);
		this.selectedChips = _.union(this.selectedPeers, this.selectedInvites);
		this.searchForm.controls.searchText.setValue('');
		this.searchInput.nativeElement.value = '';
	}

	onSearchTextAdded(event: MatChipInputEvent) {
		const input = event.input;
		const value = event.value;

		// Add our peer
		if (this.validateEmail((value || '').trim())) {
			this.selectedInvites.push({email: value.trim()});
			// Reset the input value
			if (input) {
				input.value = '';
			}
		}

		this.searchForm.controls.searchText.setValue('');
		this.selectedChips = _.union(this.selectedPeers, this.selectedInvites);
	}

	onSearch(event: any) {
		console.log(this.searchForm.value.searchText);
		this._searchService.getPeerSearch(this.searchForm.value.searchText, (err, result) => {
			if (!err) {
				this.searchOptions = result;
			} else {
				console.log(err);
			}
		});
	}

	validateEmail(email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	addParticipant() {
		this.httpLoading = true;
		let i = 0, j = 0;
		if (this.selectedPeers && this.selectedPeers.length > 0) {
			i = 0;
			this.selectedPeers.forEach(peer => {
				this._collectionService.addParticipant(this.data.collectionId, peer.id, this.data.calendarId, peer.scholarshipId).subscribe((response: any) => {
					i++;
					if (i === this.selectedPeers.length && j === this.selectedInvites.length) {
						this.matSnackBar.open('All selected users have been added to this cohort.', 'Close', { duration: 5000 });
						this.httpLoading = false;
						this.dialogRef.close(true);
					}
				}, err => {
					i++;
					console.log(err);
					this.matSnackBar.open('Error adding user: ' + peer.name, 'Close', { duration: 5000 });
					this.httpLoading = false;
				});
			});
		}
		if (this.selectedInvites && this.selectedInvites.length > 0) {
			j = 0;
			const selectedInvitees: Array<PeerInvite> = [];
			this.selectedInvites.forEach(invite => {
				selectedInvitees.push({
					email: invite.email,
					name: '',
					peerId: this.peerId,
					status: 'pending',
					contactId: '',
					collectionId: this.data.collectionId,
					calendarId: this.data.calendarId
				});
			});
			this._socialSharingService.inviteContacts(this.peerId, selectedInvitees).subscribe(res => {
				j = this.selectedInvites.length;
				if (j === this.selectedInvites.length && i === this.selectedPeers.length) {
					this.matSnackBar.open('Your invitations to all selected participants have been sent.', 'Close', { duration: 5000 });
					this.httpLoading = false;
					this.dialogRef.close(true);
				}
			}, err => {
				j = this.selectedInvites.length;
				console.log(err);
				this.matSnackBar.open('Error inviting users.', 'Close', { duration: 5000 });
				this.httpLoading = false;
			});
		}
	}

	public uploadExcel(target) {
		console.log(target);
		/* wire up file reader */
		const reader: FileReader = new FileReader();
		reader.onload = (e: any) => {
			/* read workbook */
			const bstr: string = e.target.result;
			const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

			/* grab first sheet */
			const wsname: string = wb.SheetNames[0];
			const ws: XLSX.WorkSheet = wb.Sheets[wsname];

			/* save data */
			this.excelData = XLSX.utils.sheet_to_json(ws, {header: 1});
			console.log(this.excelData);
			this.inviteExcelContacts();
		};
		reader.readAsBinaryString(target.files[0]);
	}

	inviteExcelContacts() {
		this.httpLoading = true;
		const selectedInvitees: Array<PeerInvite> = [];
		if (this.excelData && this.excelData.length > 0) {
			this.excelData.forEach((row, index) => {
				if (index !== 0) {
					selectedInvitees.push({
						email: row[3],
						name: row[1] + ' ' + row[2],
						peerId: this.peerId,
						status: 'pending',
						contactId: '',
						collectionId: this.data.collectionId,
						calendarId: this.data.calendarId
					});
				}
			});
			this._socialSharingService.inviteContacts(this.peerId, selectedInvitees).subscribe(res => {
				this.matSnackBar.open(this.excelData.length - 1 + ' participants have been invited.', 'Close', { duration: 5000 });
				this.httpLoading = false;
				this.dialogRef.close(true);
			}, err => {
				console.log(err);
				this.matSnackBar.open('Error inviting users.', 'Close', { duration: 5000 });
				this.httpLoading = false;
			});
		}
	}

	public openExistingInvites() {
		this.dialogRef.close({action: 'viewParticipants'});
	}

}

interface PeerObject {
	id: string;
	name: string;
	scholarshipId: string;
}

interface PeerInvite {
	name: string;
	email: string;
	peerId: string;
	status: string;
	contactId?: string;
	collectionId?: string;
	calendarId?: string;
}
