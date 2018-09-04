import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { TopicService } from '../../_services/topic/topic.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { SelectTopicsComponent } from '../dialogs/select-topics/select-topics.component';
import { SelectPriceComponent } from '../dialogs/select-price/select-price.component';
import { SelectDurationComponentComponent } from '../dialogs/select-duration-component/select-duration-component.component';

import * as moment from 'moment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
@Component({
	selector: 'app-classes',
	templateUrl: './classes.component.html',
	styleUrls: ['./classes.component.scss'],
	animations: [
		trigger('slideInOut', [
			state('in', style({
				transform: 'translate3d(0, 0, 0)'
			})),
			state('out', style({
				transform: 'translate3d(100%, 0, 0)'
			})),
			transition('in => out', animate('400ms ease-in-out')),
			transition('out => in', animate('400ms ease-in-out'))
		]),
	]
})
export class ClassesComponent implements OnInit {
	public availableTopics: Array<any>;
	public topicsBackup: Array<any>;

	public userId;
	public classes: Array<any>;
	public classesBackup: Array<any>;
	@ViewChild('topicButton') topicButton;
	@ViewChild('priceButton') priceButton;
	@ViewChild('durationButton') durationButton;

	public availableRange: Array<number>;
	public selectedRange: Array<number>;

	public availableDurationRange: Array<number>;
	public selectedDurationRange: Array<number>;


	public initialized: boolean;
	public selectedTopics: Array<any>;
	public loading = false;
	public envVariable;
	private today = moment();
	public filterForm: FormGroup;
	public languageList: Array<any>;
	public levelList: Array<any>;
	public ratingList: Array<number>;
	public showArchived: boolean;
	public availableSubtypes: Array<string>;

	constructor(
		public _collectionService: CollectionService,
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private _topicService: TopicService,
		public dialog: MatDialog,
		public elRef: ElementRef,
		public _dialogsService: DialogsService,
		private _fb: FormBuilder,
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}
	ngOnInit() {
		this.fetchData();
		this.initializeFilters();
		this.setTags();
	}

	private setTags() {
		this.titleService.setTitle('Classes');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Explore Classes'
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

	private initializeFilters() {
		this.filterForm = this._fb.group({
			language: [],
			difficultyLevel: [],
			rating: [],
			subtype: []
		});

		this.filterForm.valueChanges.subscribe(res => {
			this.fitlerResults();
		});
	}

	private fitlerResults() {
		this.classes = this.classesBackup.filter((val) => {
			let languageBool = false;
			let priceBool = false;
			let durationBool = false;
			let levelBool = false;
			let ratingBool = false;
			let subtypeBool = false;

			if (this.filterForm.value.language && this.filterForm.value.language.length > 0) {
				for (let i = 0; (i < this.filterForm.value.language.length && !languageBool); i++) {
					const language = this.filterForm.value.language[i];
					if (val.language.includes(language) && !languageBool) {
						languageBool = true;
					}
				}
			} else {
				languageBool = true;
			}

			if (this.filterForm.value.difficultyLevel && this.filterForm.value.difficultyLevel.length > 0) {
				for (let i = 0; (i < this.filterForm.value.difficultyLevel.length && !levelBool); i++) {
					const level = this.filterForm.value.difficultyLevel[i];
					if (val.difficultyLevel === level) {
						levelBool = true;
					}
				}
			} else {
				levelBool = true;
			}

			if (this.filterForm.value.rating && this.filterForm.value.rating.length > 0) {
				console.log(this.filterForm.value.rating);
				for (let i = 0; (i < this.filterForm.value.rating.length && !ratingBool); i++) {
					const rating = this.filterForm.value.rating[i];
					if (val.rating === rating) {
						ratingBool = true;
					}
				}
			} else {
				ratingBool = true;
			}

			if (this.filterForm.value.subtype && this.filterForm.value.subtype.length > 0) {
				for (let i = 0; (i < this.filterForm.value.subtype.length && !subtypeBool); i++) {
					const subtype = this.filterForm.value.subtype[i];
					console.log(subtype);
					console.log(val.subCategory);

					if (val.subCategory === subtype) {
						subtypeBool = true;
					}
				}
			} else {
				subtypeBool = true;
			}


			if (this.selectedRange) {
				priceBool = (val.price >= this.selectedRange[0] && val.price <= this.selectedRange[1]);
			} else {
				priceBool = true;
			}

			if (this.selectedDurationRange) {
				durationBool = (val.totalHours >= this.selectedDurationRange[0] && val.totalHours <= this.selectedDurationRange[1]);
			} else {
				durationBool = true;
			}

			return languageBool && priceBool && durationBool && levelBool && ratingBool && subtypeBool;
		});
	}

	fetchData() {
		this.loading = true;
		this.fetchTopics().subscribe(
			response => {
				this.loading = false;
				this.availableTopics = response;
				this.topicsBackup = _.cloneDeep(response);
				this.fetchClasses();
			}, err => {
				this.loading = false;
				console.log(err);
			});
	}

	fetchTopics(): Observable<Array<any>> {
		const query = {
			order: 'name ASC'
		};
		return this._topicService.getTopics(query).pipe(map(
			(response: any) => {
				const availableTopics = [];
				response.forEach(topic => {
					availableTopics.push({ 'topic': topic, 'checked': false });
				});
				return availableTopics;
			}, (err) => {
				console.log(err);
			}
		));
	}

	fetchClasses(): void {
		let query;
		this.selectedTopics = [];
		for (const topicObj of this.availableTopics) {
			if (topicObj['checked']) {
				this.selectedTopics.push({ 'name': topicObj['topic'].name });
			}
		}
		if (this.selectedTopics.length < 1) {
			query = {
				'include': [
					{ 'relation': 'collections', 'scope': { 'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'participants', 'calendars', { 'bookmarks': 'peer' }, { 'contents': ['schedules', 'locations'] }], 'where': { 'type': 'class' } } }
				]
			};
		} else {
			query = {
				'include': [
					{ 'relation': 'collections', 'scope': { 'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'participants', 'calendars', { 'bookmarks': 'peer' }, { 'contents': ['schedules', 'locations'] }], 'where': { 'type': 'class' } } }
				],
				'where': { or: this.selectedTopics }
			};
		}


		this._topicService.getTopics(query)
			.subscribe(
				(response: any) => {
					const classes = [];
					for (const responseObj of response) {
						responseObj.collections.forEach(collection => {
							if (collection.status === 'active') {
								if (collection.owners && collection.owners[0].reviewsAboutYou) {
									collection.rating = this._collectionService.calculateCollectionRating(collection.id, collection.owners[0].reviewsAboutYou);
									collection.ratingCount = this._collectionService.calculateCollectionRatingCount(collection.id, collection.owners[0].reviewsAboutYou);
								}
								let hasActiveCalendar = false;
								if (collection.calendars) {
									collection.calendars.forEach(calendar => {
										if (moment(calendar.endDate).diff(this.today, 'days') >= -1) {
											hasActiveCalendar = true;
											return;
										}
									});
								}
								if (hasActiveCalendar) {
									classes.push(collection);
								} else if (!hasActiveCalendar && this.showArchived) {
									classes.push(collection);
								}
							}
						});
					}
					this.classes = _.uniqBy(classes, 'id');
					this.classes = _.orderBy(this.classes, ['createdAt'], ['desc']);
					this.classesBackup = _.cloneDeep(this.classes);

					if (!this.initialized) {
						console.log(this.classes);
						this.setFilterData();
						this.initialized = true;
						this.activatedRoute.queryParams.forEach(param => {
							for (const property in param) {
								if (param.hasOwnProperty(property)) {
									if (this.filterForm.contains(property)) {
										this.filterForm.controls[property].patchValue([param[property]]);
									}
								}
							}
						});
					}
				}, (err) => {
					console.log(err);
				}
			);
	}

	private setFilterData() {
		this.languageList = [];
		this.levelList = [];
		this.ratingList = [5, 4, 3, 2, 1, 0];
		this.availableSubtypes = ['instructor led', 'self paced'];

		let maxPrice = 0;
		const minPrice = 0;

		let maxDuration = 0;
		const minDuration = 0;

		this.classes.forEach(_class => {
			if (maxPrice < _class.price) {
				maxPrice = _class.price;
			}
			if (maxDuration < _class.totalHours) {
				maxDuration = _class.totalHours;
			}

			_class.language.forEach(language => {
				if (!this.languageList.includes(language)) {
					this.languageList.push(language);
				}
			});

			if (!this.levelList.includes(_class.difficultyLevel)) {
				this.levelList.push(_class.difficultyLevel);
			}

		});

		this.availableDurationRange = [minDuration, maxDuration];
		this.selectedDurationRange = _.clone(this.availableDurationRange);

		this.availableRange = [minPrice, maxPrice];
		this.selectedRange = _.clone(this.availableRange);

	}

	openTopicsDialog(): void {
		const dialogRef = this.dialog.open(SelectTopicsComponent, {
			width: '250px',
			height: '300px',
			data: this.availableTopics,
			panelClass: ['responsive-dialog', 'responsive-fixed-position'],
			disableClose: true,
			position: {
				top: this.topicButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
				left: this.topicButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
			}
		});

		dialogRef.afterClosed().subscribe((result: any) => {
			if (result) {
				this.availableTopics = result;
				this.fetchClasses();
			}
		});
	}

	public openPriceDialog(): void {
		const dialogRef = this.dialog.open(SelectPriceComponent, {
			width: '200px',
			height: '190px',
			panelClass: ['responsive-dialog', 'responsive-fixed-position'],
			data: {
				availableRange: this.availableRange,
				selectedRange: this.selectedRange
			},
			disableClose: true,
			position: {
				top: this.priceButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
				left: this.priceButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
			}
		});

		dialogRef.afterClosed().subscribe((result: any) => {
			if (result) {
				this.selectedRange = result.selectedRange;
				this.fitlerResults();
			}
		});
	}

	public openDurationDialog(): void {
		const dialogRef = this.dialog.open(SelectDurationComponentComponent, {
			width: '200px',
			height: '190px',
			panelClass: ['responsive-dialog', 'responsive-fixed-position'],
			data: {
				availableRange: this.availableDurationRange,
				selectedRange: this.selectedDurationRange
			},
			disableClose: true,
			position: {
				top: this.durationButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
				left: this.durationButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
			}
		});
		dialogRef.afterClosed().subscribe((result: any) => {
			if (result) {
				this.selectedDurationRange = result.selectedRange;
				this.fitlerResults();
			}
		});
	}

	public filterClickedTopic(index) {
		this.availableTopics = _.cloneDeep(this.topicsBackup);
		this.availableTopics[index]['checked'] = true;
		this.fetchClasses();
	}

	public resetTopics() {
		this.availableTopics = _.cloneDeep(this.topicsBackup);
		this.fetchClasses();
	}

	public onClassRefresh(event) {
		if (event) {
			this.fetchClasses();
		}
	}

	public toggleArchive() {
		console.log('show archive');
		this.classes = [];
		this.loading = true;
		console.log(this.showArchived);
		this.showArchived = !this.showArchived;
		this.fetchData();
	}
}
