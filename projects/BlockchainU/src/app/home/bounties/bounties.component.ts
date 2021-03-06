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
	selector: 'app-bounties',
	templateUrl: './bounties.component.html',
	styleUrls: ['./bounties.component.scss'],
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
export class BountiesComponent implements OnInit {
	public availableTopics: Array<any>;
	public topicsBackup: Array<any>;

	public userId;
	public bounties: Array<any>;
	public bountiesBackup: Array<any>;
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
	public locationList: Array<any>;
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
		this.titleService.setTitle('Bounties');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Explore Bounties'
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
			location: [],
			difficultyLevel: [],
			rating: [],
			subtype: []
		});

		this.filterForm.valueChanges.subscribe(res => {
			this.fitlerResults();
		});
	}

	private fitlerResults() {
		this.bounties = this.bountiesBackup.filter((val) => {
			let languageBool = false;
			let locationBool = false;
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

			if (this.filterForm.value.location && this.filterForm.value.location.length > 0) {
				for (let i = 0; (i < this.filterForm.value.location.length && !locationBool); i++) {
					const location = this.filterForm.value.location[i];
					if (val.location === location) {
						locationBool = true;
					}
				}
			} else {
				locationBool = true;
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

			if (this.filterForm.value.subtype && this.filterForm.value.subtype.length > 0) {
				for (let i = 0; (i < this.filterForm.value.subtype.length && !subtypeBool); i++) {
					const subtype = this.filterForm.value.subtype[i];
					if (val.subCategory === subtype) {
						subtypeBool = true;
					}
				}
			} else {
				subtypeBool = true;
			}


			if (this.filterForm.value.rating && this.filterForm.value.rating.length > 0) {
				for (let i = 0; (i < this.filterForm.value.rating.length && !ratingBool); i++) {
					const rating = this.filterForm.value.rating[i];
					if (val.rating === rating || (rating === 0)) {
						ratingBool = true;
					}
				}
			} else {
				ratingBool = true;
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

			return languageBool && locationBool && priceBool && durationBool && levelBool && ratingBool && subtypeBool;
		});
	}

	fetchData() {
		this.loading = true;
		this.fetchTopics().subscribe(
			response => {
				this.availableTopics = response;
				this.topicsBackup = _.cloneDeep(response);
				this.fetchBounties();
			}, err => {
				this.loading = false;
				console.log(err);
			});
	}

	fetchTopics(): Observable<Array<any>> {
		let query;
		if (this.showArchived) {
			query = {
				order: 'name ASC',
			};
		} else {
			query = {
				order: 'name ASC',
				'include': [
					{
						'relation': 'collections',
						'scope': {
							'where': { 'type': 'bounty', 'status': 'active' }
						}
					}
				]
			};
		}
		return this._topicService.getTopics(query).pipe(
			map(
				(response: any) => {
					const availableTopics = [];
					response.forEach(topic => {
						if (this.showArchived) {
							availableTopics.push({ 'topic': topic, 'checked': false });
						} else {
							if (topic.collections.length > 0) {
								availableTopics.push({ 'topic': topic, 'checked': false });
							}
						}
					});
					return availableTopics;
				}, (err) => {
					console.log(err);
				}
			)
		);
	}

	fetchBounties(): void {
		this.loading = true;
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
					{
						'relation': 'collections',
						'scope': {
							'include':
								[{ 'owners': ['reviewsAboutYou', 'profiles'] },
									'participants',
									'calendars',
									'rewards',
								{ 'bookmarks': 'peer' },
									'rewards',
								{ 'contents': ['schedules', 'locations'] }
								], 'where': { 'type': 'bounty' }
						}
					}
				]
			};
		} else {
			query = {
				'include': [
					{
						'relation': 'collections', 'scope': {
							'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] },
								'rewards',
								'participants', 'calendars', 'rewards', { 'bookmarks': 'peer' },
							{ 'contents': ['schedules', 'locations'] }], 'where': { 'type': 'bounty' }
						}
					}
				],
				'where': { or: this.selectedTopics }
			};
		}


		this._topicService.getTopics(query)
			.subscribe(
				(response: any) => {
					const bounties = [];
					for (const responseObj of response) {
						responseObj.collections.forEach(collection => {
							if (collection.status === 'active') {
								if (collection.owners && collection.owners[0].reviewsAboutYou) {
									collection.rating = this._collectionService
										.calculateCollectionRating(collection.id, collection.owners[0].reviewsAboutYou);
									collection.ratingCount = this._collectionService
										.calculateCollectionRatingCount(collection.id, collection.owners[0].reviewsAboutYou);
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
									bounties.push(collection);
								} else if (!hasActiveCalendar && this.showArchived) {
									bounties.push(collection);
								}
							}
						});
					}

					this.bounties = _.uniqBy(bounties, 'id');
					this.bounties = _.orderBy(this.bounties, ['createdAt'], ['desc']);
					this.bountiesBackup = _.cloneDeep(this.bounties);

					if (!this.initialized) {
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
					this.loading = false;
				}, (err) => {
					this.loading = false;
					console.log(err);
				}
			);
	}

	private setFilterData() {
		this.languageList = [];
		this.locationList = [];
		this.levelList = [];
		this.ratingList = [5, 4, 3, 2, 1, 0];
		this.availableSubtypes = ['workshop', 'meetup', 'hackathon', 'bootcamp'];
		let maxPrice = 0;
		const minPrice = 0;

		let maxDuration = 0;
		const minDuration = 0;

		this.bounties.forEach(bounty => {
			if (maxPrice < bounty.price) {
				maxPrice = bounty.price;
			}
			if (maxDuration < bounty.totalHours) {
				maxDuration = bounty.totalHours;
			}

			bounty.language.forEach(language => {
				if (!this.languageList.includes(language)) {
					this.languageList.push(language);
				}
			});

			if (!this.locationList.includes(bounty.location)) {
				this.locationList.push(bounty.location);
			}

			if (!this.levelList.includes(bounty.difficultyLevel)) {
				this.levelList.push(bounty.difficultyLevel);
			}

		});

		this.availableDurationRange = [minDuration, maxDuration];
		this.selectedDurationRange = _.clone(this.availableDurationRange);
		this.availableRange = [minPrice, maxPrice];
		this.selectedRange = _.clone(this.availableRange);
	}

	public openTopicsDialog(): void {
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
				this.fetchBounties();
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
		this.fetchBounties();
	}

	public resetTopics() {
		this.availableTopics = _.cloneDeep(this.topicsBackup);
		this.fetchBounties();
	}

	public onBountyRefresh(event) {
		if (event) {
			this.fetchBounties();
		}
	}

	public toggleArchive() {
		this.bounties = [];
		this.loading = true;
		console.log('show archive');
		console.log(this.showArchived);
		this.showArchived = !this.showArchived;
		this.fetchData();
	}
}
