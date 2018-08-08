import {
	Component, OnInit, Inject, ElementRef, ViewChild, Input,
	forwardRef, EventEmitter, HostBinding, HostListener, Output, OnChanges, SimpleChanges
} from '@angular/core';
import {
	FormGroup, FormBuilder, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR
	, NG_VALIDATORS, Validator
} from '@angular/forms';
import { CommunityService } from '../../community/community.service';
import { SearchService } from '../../search/search.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { CollectionService } from '../../collection/collection.service';

import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { RequestHeaderService } from '../../requestHeader/request-header.service';

import * as _ from 'lodash';
import { ConsoleLearningAllComponent } from '../../../console/console-learning/console-learning-all/console-learning-all.component';
import { Router } from '@angular/router';
import { flatMap } from 'rxjs/operators';

@Component({
	selector: 'app-generate-knowledge-story',
	templateUrl: './generate-knowledge-story.component.html',
	styleUrls: ['./generate-knowledge-story.component.scss']
})
export class GenerateKnowledgeStoryComponent implements OnInit {
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

	@ViewChild('peerInput') peerInput: ElementRef;

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	public allPeers = false;

	public selectedPeers: Array<PeerObject>;
	public myControl = new FormControl('');
	public searchOptions: Array<any>;


	constructor(myElement: ElementRef,
		private http: HttpClient,
		public requestHeaderService: RequestHeaderService,
		public dialogRef: MatDialogRef<GenerateKnowledgeStoryComponent>,
		public _collectionService: CollectionService,
		public _searchService: SearchService,
		public router: Router,
		@Inject(MAT_DIALOG_DATA) public data: any) {
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
		this.selectedPeers = [];
		this.myControl.valueChanges.pipe(flatMap((value) => {
			console.log(value);
			return this._searchService.getPeerSearchResults(value);
		})).subscribe((res: any) => {
			console.log(res);
			this.searchOptions = res;
		});
	}

	submitTopics() {
		console.log(this.selected);
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
		console.log('Removing item: ' + item);
		this.selected.splice(this.selected.indexOf(item), 1);
		if (this.selected.length < this.maxSelection && this.maxSelection !== -1) {
			this.maxTopicMsg = '';
		}
		this.removed.push(item);
		this.selectedOutput.emit(this.selected);
		this.removedOutput.emit(this.removed);
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
		this.peerInput.nativeElement.value = '';
	}

	submitPeers() {
		this.dialogRef.close({
			selectedPeers: this.allPeers ? [] : this.selectedPeers,
			selectedTopics: this.selected
		});
	}

	public openExistingStories() {
		this.dialogRef.close();
		this.router.navigate(['console', 'learning', 'story']);
	}
}

interface PeerObject {
	id: string;
	name: string;
}
