import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { CommunityService } from '../../community/community.service';
import { SearchService } from '../../search/search.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { CollectionService } from '../../collection/collection.service';

import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { Observable } from 'rxjs/observable';
import { map, startWith } from 'rxjs/operators';

@Component({
	selector: 'app-scholarship-dialog',
	templateUrl: './scholarship-dialog.component.html',
	styleUrls: ['./scholarship-dialog.component.scss']
})
export class ScholarshipDialogComponent implements OnInit {
	
	public scholarshipForm: FormGroup;
	public selectedWorkshops: Array<any>;
	public myControl = new FormControl('');
	public userId: string;
	public options: Array<any>;
	public selectedCollections: Array<CollectionObject>;
	public filteredCollection: Observable<Array<any>>;
	public allCollection = false;
	
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	
	// Enter, comma
	separatorKeysCodes = [ENTER, COMMA];
	
	@ViewChild('collctionInput') collctionInput: ElementRef;
	
	
	
	constructor(
		private _fb: FormBuilder,
		private _communityService: CommunityService,
		public dialogRef: MatDialogRef<ScholarshipDialogComponent>,
		private matSnackBar: MatSnackBar,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public _searchService: SearchService,
		private _CookieUtilsService: CookieUtilsService,
		public _collectionService: CollectionService
	) {
		this.userId = this._CookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.scholarshipForm = this._fb.group({
			ethAddress: this.data.ethAddress ? this.data.ethAddress : '',
			type: this.data.type ? this.data.type : 'private',
			max_karma: this.data.max_karma ? this.data.max_karma : '',
			min_gyan: this.data.min_gyan ? this.data.min_gyan : '',
			title: this.data.title ? this.data.title : '',
			description: this.data.description ? this.data.description : ''
		});
		
		this.myControl.valueChanges.subscribe((value) => {
			this._searchService.getAllSearchResults(this.userId, value, (err, result) => {
				if (!err) {
					this.options = result;
				} else {
					console.log(err);
				}
			});
		});
		this.selectedCollections = [];
	}
	
	public submitForm() {
		this.dialogRef.close({
			scholarshipForm: this.scholarshipForm.value,
			selectedCollections: this.allCollection ? [] : this.selectedCollections
		});
	}
	
	
	remove(collection: any): void {
		const index = this.selectedCollections.indexOf(collection);
		
		if (index >= 0) {
			this.selectedCollections.splice(index, 1);
		}
	}
	
	
	onSearchOptionClicked(event: any): void {
		console.log(event);
		this.selectedCollections.push(
			{
				id: event.data.id,
				title: event.data.title
			}
		);
		console.log(this.selectedCollections);
		this.collctionInput.nativeElement.value = '';
	}
	
}

interface CollectionObject {
	id: string;
	title: string;
}
