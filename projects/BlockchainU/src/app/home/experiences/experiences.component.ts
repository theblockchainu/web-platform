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
	selector: 'app-experiences',
	templateUrl: './experiences.component.html',
	styleUrls: ['./experiences.component.scss'],
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
export class ExperiencesComponent implements OnInit {
	public availableTopics: Array<any>;
	public topicsBackup: Array<any>;

	public userId;
	public experiences: Array<any>;
	public experiencesBackup: Array<any>;
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
		this.titleService.setTitle('In-person Workshops');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Explore In-person Workshops'
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
			subtype: [],
			title: []
		});

		this.filterForm.valueChanges.subscribe(res => {
			this.fitlerResults();
		});
	}

	private fitlerResults() {
		this.experiences = this.experiencesBackup.filter((val) => {
			let languageBool = false;
			let locationBool = false;
			let priceBool = false;
			let durationBool = false;
			let levelBool = false;
			let ratingBool = false;
			let subtypeBool = false;
			let titleBool = false;

			if (this.filterForm.value.title && this.filterForm.value.title.length > 0) {
				for (let i = 0; (i < this.filterForm.value.title.length && !titleBool); i++) {
					const titleQuery = this.filterForm.value.title[i];
					if (_.includes(val.title, titleQuery) && !titleBool) {
						titleBool = true;
					}
				}
			} else {
				titleBool = true;
			}

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
					console.log(subtype);
					console.log(val.subCategory);

					if (val.subCategory.toLowerCase() === subtype.toLowerCase()) {
						subtypeBool = true;
					}
				}
			} else {
				subtypeBool = true;
			}


			if (this.filterForm.value.rating && this.filterForm.value.rating.length > 0) {
				for (let i = 0; (i < this.filterForm.value.rating.length && !ratingBool); i++) {
					const rating = this.filterForm.value.rating[i];
					console.log(val);
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

			return titleBool && languageBool && locationBool && priceBool && durationBool && levelBool && ratingBool && subtypeBool;
		});
	}

	fetchData() {
		this.loading = true;
		this.fetchTopics().subscribe(
			response => {
				this.availableTopics = response;
				this.topicsBackup = _.cloneDeep(response);
				this.fetchExperiences();
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
							'where': { 'type': 'experience', 'status': 'active' }
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

	fetchExperiences(): void {
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
					{ 'relation': 'collections', 'scope': { 'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'participants', 'calendars', { 'bookmarks': 'peer' }, { 'contents': ['schedules', 'locations'] }], 'where': { 'type': 'experience' } } }
				]
			};
		} else {
			query = {
				'include': [
					{ 'relation': 'collections', 'scope': { 'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'participants', 'calendars', { 'bookmarks': 'peer' }, { 'contents': ['schedules', 'locations'] }], 'where': { 'type': 'experience' } } }
				],
				'where': { or: this.selectedTopics }
			};
		}


		this._topicService.getTopics(query)
			.subscribe(
				(response: any) => {
					const experiences = [];
					for (const responseObj of response) {
						responseObj.collections.forEach(collection => {
							let experienceLocation = 'Unknown location';
							let lat = 37.5293864;
							let lng = -122.008471;
							if (collection.status === 'active') {
								if (collection.contents) {
									collection.contents.forEach(content => {
										if (content.locations && content.locations.length > 0
											&& content.locations[0].city !== undefined
											&& content.locations[0].city.length > 0
											&& content.locations[0].map_lat !== undefined
											&& content.locations[0].map_lat.length > 0) {
											experienceLocation = content.locations[0].city;
											lat = parseFloat(content.locations[0].map_lat);
											lng = parseFloat(content.locations[0].map_lng);
										}
									});
									collection.location = experienceLocation;
									collection.lat = lat;
									collection.lng = lng;
								}
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
									experiences.push(collection);
								} else if (!hasActiveCalendar && this.showArchived) {
									experiences.push(collection);
								}
							}
						});
					}

					this.experiences = _.uniqBy(experiences, 'id');
					this.experiences = _.orderBy(this.experiences, ['createdAt'], ['desc']);
					this.experiencesBackup = _.cloneDeep(this.experiences);

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

		this.experiences.forEach(experience => {
			if (maxPrice < experience.price) {
				maxPrice = experience.price;
			}
			if (maxDuration < experience.totalHours) {
				maxDuration = experience.totalHours;
			}

			experience.language.forEach(language => {
				if (!this.languageList.includes(language)) {
					this.languageList.push(language);
				}
			});

			if (!this.locationList.includes(experience.location)) {
				this.locationList.push(experience.location);
			}

			if (!this.levelList.includes(experience.difficultyLevel)) {
				this.levelList.push(experience.difficultyLevel);
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
				this.fetchExperiences();
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
		this.fetchExperiences();
	}

	public resetTopics() {
		this.availableTopics = _.cloneDeep(this.topicsBackup);
		this.fetchExperiences();
	}

	public onExperienceRefresh(event) {
		if (event) {
			this.fetchExperiences();
		}
	}

	public toggleArchive() {
		this.experiences = [];
		this.loading = true;
		console.log('show archive');
		console.log(this.showArchived);
		this.showArchived = !this.showArchived;
		this.fetchData();
	}
}
