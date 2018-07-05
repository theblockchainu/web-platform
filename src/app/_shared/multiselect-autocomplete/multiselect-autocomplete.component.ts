import {
	Component, Input, forwardRef, ElementRef, EventEmitter, HostListener, Output, OnInit,
	OnChanges, SimpleChanges
} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import { CollectionService } from '../../_services/collection/collection.service';
import { TopicService } from '../../_services/topic/topic.service';

@Component({
	selector: 'app-multiselect-autocomplete',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MultiselectAutocompleteComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => MultiselectAutocompleteComponent),
			multi: true,
		}],
	styleUrls: ['./multiselect-autocomplete.component.scss'],
	templateUrl: './multiselect-autocomplete.component.html'
})
export class MultiselectAutocompleteComponent implements OnChanges {
	public query = '';
	public selected = [];
	public removed = [];
	public filteredList = [];
	public elementRef;
	public placeholderString;
	public entryInSelected = undefined;
	public selectedQueries = [];
	public maxTopicMsg;
	public loadingSuggestions = false;
	public envVariable;


	// Input parameter - jsonObject of collection
	@Input()
	private list: any = {};

	// Optional Input Parameter
	@Input()
	private searchUrl = '';

	// Optional Input Parameter
	@Input()
	private multiSelect = true;

	// Optional Input Parameter
	@Input()
	private suggestedTopics: any = [];

	@Input()
	private create = false;

	@Input()
	private createURL = '';

	@Input('title')
	public title = '';

	@Input()
	private preSelectedTopics: any = [];

	@Input('minSelection')
	private minSelection = -1;

	@Input('maxSelection')
	private maxSelection = -1;

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
		public _collectionService: CollectionService,
		public requestHeaderService: RequestHeaderService,
		private topicService: TopicService) {
		this.elementRef = myElement;
		this.placeholderString = this.title;
		this.envVariable = environment;
	}

	@HostListener('document:click', ['$event'])
	private handleClick(event) {
		let clickedComponent = event.target;
		let inside = false;
		do {
			if (clickedComponent === this.elementRef.nativeElement) {
				inside = true;
			}
			clickedComponent = clickedComponent.parentNode;
		} while (clickedComponent);
		if (!inside) {
			this.filteredList = [];
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		for (const property in changes) {
			if (property === 'preSelectedTopics') {
				this.filteredList = [];
				this.selected = _.union(this.preSelectedTopics, this.selected);
				this.selected.forEach(selectedTopic => {
					selectedTopic['inSelect'] = true;
					this.filteredList.push(selectedTopic);
				});
			} else if (property === 'suggestedTopics') {
				if (this.query === '' && this.preSelectedTopics.length === 0) {
					this.filteredList = [];
					this.suggestedTopics.forEach(suggestedTopic => {
						this.filteredList.push(suggestedTopic);
					});
				}
			}
		}
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
					.map((res: any) => {
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
					})
					.subscribe();
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
		console.log(item);
		this.selected.splice(this.selected.indexOf(item), 1);
		if (this.selected.length < this.maxSelection && this.maxSelection !== -1) {
			this.maxTopicMsg = '';
		}
		this.removed.push(item);
		this.selectedOutput.emit(this.selected);
	}

	addTopic() {
		if (this.selected.length >= this.maxSelection && this.maxSelection !== -1) {
			this.maxTopicMsg = 'You cannot select more than ' + this.maxSelection + ' topics. Please delete any existing one and then try to add.';
			return;
		} else {
			this.topicService.addNewTopic(this.query).subscribe(res => {
				this.selected.push(res);
				this.selectedOutput.emit(this.selected);
				this.query = '';
			});
		}

	}

}
