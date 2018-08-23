import {
	Component, OnInit, Input, forwardRef, ElementRef, Inject, EventEmitter
	, HostBinding, HostListener, Output, OnChanges, SimpleChanges
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
	FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR
	, NG_VALIDATORS, Validator
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { RequestHeaderService } from '../../requestHeader/request-header.service';
import { environment } from '../../../../environments/environment';
import * as _ from 'lodash';
import { CollectionService } from '../../collection/collection.service';

@Component({
	selector: 'app-multiselect-topic-dialog',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MultiselectTopicDialogComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => MultiselectTopicDialogComponent),
			multi: true,
		}],
	styleUrls: ['./multiselect-topic-dialog.component.scss'],
	templateUrl: './multiselect-topic-dialog.component.html'
})
export class MultiselectTopicDialogComponent implements OnInit {
	// implements ControlValueAccessor
	public query = '';
	public selected = [];
	public removed = [];
	public filteredList = [];
	public elementRef;
	public envVariable;
	public placeholderString;
	public entryInSelected = undefined;
	public selectedQueries = [];
	public maxTopicMsg;
	public loadingSuggestions = false;
	// Input parameter - jsonObject of collection
	@Input()
	private list: any = {};

	// Optional Input Parameter
	@Input()
	public searchUrl = '';

	// Optional Input Parameter
	@Input()
	private multiSelect = true;

	@Input()
	private create = false;

	@Input()
	public suggestedTopics: any = [];

	@Input()
	private createURL = '';

	@Input()
	public title = '';

	@Input()
	private preSelectedTopics: any = [];

	@Input()
	public minSelection = -1;

	@Input()
	public maxSelection = -1;

	@Output()
	selectedOutput = new EventEmitter<any>();

	@Output()
	removedOutput = new EventEmitter<any>();

	@Output()
	anyItemNotFound = new EventEmitter<any>();

	@Output()
	queries = new EventEmitter<any>();

	@Output()
	active = new EventEmitter<any>();

	constructor(myElement: ElementRef,
		private http: HttpClient,
		public requestHeaderService: RequestHeaderService,
		public dialogRef: MatDialogRef<MultiselectTopicDialogComponent>,
		public _collectionService: CollectionService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.elementRef = myElement;
		this.placeholderString = this.title;
		this.envVariable = environment;
	}

	ngOnInit() {
		this.filteredList = [];
		this.suggestedTopics.forEach(suggestedTopic => {
			this.filteredList.push(suggestedTopic);
		});
		console.log('Displaying filteredList');
		console.log(this.filteredList);
		this.dialogRef.backdropClick().subscribe(() => {
			this.sendDataToCaller();
		});
	}

	sendDataToCaller() {
		this.data.selected = this.selected;
		this.dialogRef.close(this.data);
	}

	ngViewInitChanges() {
		this.selected = _.union(this.preSelectedTopics, this.selected);
		console.log(this.selected);
	}

	public filter() {
		let showItemNotFound = true;
		if (!this.multiSelect) {
			if (this.filteredList.length !== 0) {
				// Force only 1 selection
				// TBD
			}
		}
		if (this.query !== '') {
			this.loadingSuggestions = true;
			this.active.emit(true);
			const query = _.find(this.selectedQueries,
				(entry) => {
					return entry === this.query;
				});
			if (!query) {
				this.selectedQueries.push(this.query);
			}
			if (Object.keys(this.list).length !== 0 && this.list.constructor === Object) {
				this.filteredList = _.filter(this.list, (item) => {
					return item.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
				});
				this.emitRequestTopic();
			}
			if (this.searchUrl) {
				const finalSearchURL = this.searchUrl + this.query;
				this.http.get(finalSearchURL, this.requestHeaderService.options)
					.subscribe((res: any) => {
						this.loadingSuggestions = false;
						this.filteredList = [];
						res.map(item => {
							this.entryInSelected = _.find(this.selected, function (entry) { return entry.id === item.id; });
							showItemNotFound = !this.entryInSelected;
							const obj = {};
							obj['id'] = item.id;
							obj['name'] = item.name;
							obj['type'] = item.type;
							obj['createdAt'] = item.createdAt;
							obj['updatedAt'] = item.updatedAt;
							obj['inSelect'] = !!this.entryInSelected;
							obj['imageUrl'] = item.imageUrl;
							this.filteredList.push(obj);
						});
						if (showItemNotFound) {
							this.emitRequestTopic();
						}
					});
			}
		} else {
			this.loadingSuggestions = false;
			this.active.emit(false);
			this.filteredList = this.preSelectedTopics.length > 0 ? this.preSelectedTopics : [];
			this.anyItemNotFound.emit('');
			this.selectedOutput.emit(this.selected);
		}
	}

	private emitRequestTopic() {
		if (this.filteredList.length === 0) {
			this.anyItemNotFound.emit(this.query);
		} else {
			this.anyItemNotFound.emit('');
		}
	}

	public select(item) {
		const itemPresent = _.find(this.selected, function (entry) { return item.id === entry.id; });
		if (itemPresent) {
			this.selected = _.remove(this.selected, function (entry) { return item.id !== entry.id; });
			if (this.selected.length < this.maxSelection && this.maxSelection !== -1) {
				this.maxTopicMsg = '';
			}
			this.removedOutput.emit(this.removed);
		} else {
			if (this.selected.length >= this.maxSelection && this.maxSelection !== -1) {
				this.maxTopicMsg = 'You cannot select more than ' + this.maxSelection + ' topics. Please delete any existing one and then try to add.';
				return;
			}
			if (this.preSelectedTopics.length !== 0) {
				this.selected = _.union(this.preSelectedTopics, this.selected);
			}
			this.selected.push(item);
		}
		this.selectedOutput.emit(this.selected);
		this.queries.emit(this.selectedQueries);
		this.query = '';
		this.filteredList = [];
	}

	public remove(item) {
		this.selected.splice(this.selected.indexOf(item), 1);
		if (this.selected.length < this.maxSelection && this.maxSelection !== -1) {
			this.maxTopicMsg = '';
		}
		this.removed.push(item);
		this.selectedOutput.emit(this.selected);
		this.removedOutput.emit(this.removed);
	}
}

