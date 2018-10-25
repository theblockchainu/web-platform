import { Component, OnInit, Inject } from '@angular/core';
import { SearchService } from '../../search/search.service';
import { environment } from '../../../../environments/environment';
import { CollectionService } from '../../collection/collection.service';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';

@Component({
	selector: 'app-add-participant-dialog',
	templateUrl: './add-participant-dialog.component.html',
	styleUrls: ['./add-participant-dialog.component.scss']
})
export class AddParticipantDialogComponent implements OnInit {
	
	public peerId: string;
	public selectedPeers: Array<PeerObject>;
	public searchField: string;
	public searchOptions: Array<any>;
	public envVariable: any;
	
	constructor(private _searchService: SearchService,
				@Inject(MAT_DIALOG_DATA) public data: any,
				public _collectionService: CollectionService,
				private matSnackBar: MatSnackBar,
				public dialogRef: MatDialogRef<AddParticipantDialogComponent>,
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		this.selectedPeers = [];
	}
	
	removePeer(peer: any): void {
		const index = this.selectedPeers.indexOf(peer);
		
		if (index >= 0) {
			this.selectedPeers.splice(index, 1);
		}
	}
	
	onSearchOptionClicked(data: any): void {
		console.log(data);
		this.selectedPeers.push(
			{
				id: data.id,
				name: data.profiles[0].first_name + ' ' + data.profiles[0].last_name
			}
		);
		console.log(this.selectedPeers);
		this.searchField = '';
	}
	
	onSearch(event: any) {
		console.log(this.searchField);
		this._searchService.getPeerSearchResults(this.searchField).subscribe((res: any) => {
			console.log(res);
			this.searchOptions = res;
		});
	}
	
	addParticipant() {
		if (this.selectedPeers && this.selectedPeers.length > 0) {
			let i = 0;
			this.selectedPeers.forEach(peer => {
				this._collectionService.addParticipant(this.data.collectionId, peer.id, this.data.calendarId).subscribe((response: any) => {
					i++;
					if (i === this.selectedPeers.length) {
						this.matSnackBar.open('Added user as a participant to this cohort.', 'Close', { duration: 5000 });
						this.dialogRef.close(true);
					}
				}, err => {
					i++;
					console.log(err);
					this.matSnackBar.open('Error adding user: ' + peer.name, 'Close', { duration: 5000 });
				});
			});
		}
	}
	
}

interface PeerObject {
	id: string;
	name: string;
}
