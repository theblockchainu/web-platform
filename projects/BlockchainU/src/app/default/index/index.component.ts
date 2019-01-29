import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { TopicService } from '../../_services/topic/topic.service';
import { CommunityService } from '../../_services/community/community.service';
import { TitleCasePipe } from '@angular/common';
import { SearchService } from '../../_services/search/search.service';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';
import { QuestionService } from '../../_services/question/question.service';

@Component({
	selector: 'app-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	public loadingHome = false;
	private email: string;
	notifyForm: FormGroup;
	public loggedIn = false;
	public userId;


	public classes: Array<any>;
	public experiences: Array<any>;
	public bounties: Array<any>;
	public communities: Array<any>;
	public questions: Array<any>;
	public peers: Array<any>;
	public loadingClasses = false;
	public loadingExperiences = false;
	public loadingBounties = false;
	public loadingCommunities = false;
	public loadingQuestions = false;
	public loadingPeers = false;
	private today = moment();
	public envVariable;

	public classesCount: number;
	public experiencesCount: number;
	public communitiesCount: number;
	public bountiesCount: number;

	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public now: Date;
	public cardInFocus = false;
	public myControl = new FormControl('');
	public options: any[];
	public searching: boolean;
	public guides: Array<any>;
	public loadingGuides = false;
	public popularSearches = [];
	loadingLearningPaths: boolean;
	learningPaths: Array<any>;

	constructor(
		private authenticationService: AuthenticationService,
		public _fb: FormBuilder,
		private _router: Router,
		public dialog: MatDialog,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private _cookieUtilsService: CookieUtilsService,
		private titleService: Title,
		private metaService: Meta,
		private dialogsService: DialogsService,
		private _activatedRoute: ActivatedRoute,
		public _collectionService: CollectionService,
		private _topicService: TopicService,
		public _communityService: CommunityService,
		public _questionService: QuestionService,
		private titlecasepipe: TitleCasePipe,
		public _profileService: ProfileService,
		public _searchService: SearchService
	) {
	}

	ngOnInit() {
		this.loadingHome = false;
		this.options = [
			'ethereum',
			'hyperledger',
			'blockchain',
			'cryptography',
			'design thinking',
			'machine learning'
		];
		this.notifyForm = this._fb.group(
			{ email: ['', [Validators.required, Validators.email]] }
		);

		this.userId = this._cookieUtilsService.getValue('userId');
		this.authenticationService.isLoggedIn().pipe(first()).subscribe((res: any) => {
			this.loggedIn = res;
			if (this.loggedIn) {
				this._router.navigate(['home', 'homefeed']);
			}
		});
		this._activatedRoute.url.pipe(first()).subscribe(res => {
			if (res[0] && res[0].path === 'login') {
				if (!this.loggedIn) {
					this.dialogsService.openLogin().subscribe();
				}
			}
		});
		this.setTags();
		this.fetchGuides();
		this.fetchQuestions();
		this.fetchCommunities();
		this.fetchClasses();
		this.fetchExperiences();
		this.fetchBounties();
		this.fetchPeers();
		this.initialiseSearchService();
		this.fetchLearningPath();
	}

	private fetchLearningPath() {
		this.loadingLearningPaths = true;
		this._collectionService.fetchTrendingCollections('learning-path').subscribe(
			(collections: any) => {
				console.log('collections');
				console.log(collections);
				this.learningPaths = [];
				collections.forEach(collection => {
					const topics = [];
					collection.topics.forEach(topicObj => {
						topics.push(this.titlecasepipe.transform(topicObj.name));
					});
					if (topics.length > 0) {
						collection.topics = topics;
					} else {
						topics.push('No topics selected');
						collection.topics = topics;
					}
					this.learningPaths.push(collection);
				});
				this.loadingLearningPaths = false;
			}, (err) => {
				console.log(err);
			}
		);
	}

	public onGuideRefresh(event) {
		if (event) {
			this.fetchGuides();
		}
	}

	initialiseSearchService() {
		this.myControl.valueChanges.subscribe((value) => {
			console.log(value);
			this.options = [];
			if (value && value.length > 0) {
				this.searching = true;
				this._searchService.getAllSearchResults(null, value, (err, result) => {
					if (!err) {
						this.options = result;
						this.searching = false;
					} else {
						console.log(err);
						this.searching = false;
					}
				});
			} else {
				this.searching = false;
				this.options = [
					'ethereum',
					'hyperledger',
					'blockchain',
					'cryptography',
					'design thinking',
					'machine learning'
				];
			}
		});
	}
	public openVideo() {
		const url = '/assets/video/homepageExplainer.mp4';
		this.dialogsService.openVideo(url).subscribe();
	}
	public sendEmailSubscriptions() {
		if (this.notifyForm.valid) {
			this.email = this.notifyForm.controls['email'].value;
			this.authenticationService.sendEmailSubscriptions(this.email)
				.subscribe();
			this.snackBar.open('We have registered your email for all our future updates.', 'Thanks', {
				duration: 5000
			});
		} else {
			this.snackBar.open('Please enter a valid email address', 'Ok', {
				duration: 5000
			});
		}
	}

	public openSignup() {
		this.dialogsService.openSignup('invite/1').subscribe();
	}

	public openTelegram() {
		window.location.href = 'https://t.me/theblockchainu';
	}

	private setTags() {
		this.titleService.setTitle('The Blockchain University - World largest community of Blockchain Certified Professionals');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'The Blockchain University - World largest community of Blockchain Certified Professionals'
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
			content: environment.clientUrl + this._router.url
		});
	}

	fetchClasses() {
		this.loadingClasses = true;
		this._collectionService.fetchTrendingCollections('class').subscribe(
			(collections: any) => {
				this.loadingClasses = false;
				this.classes = collections;
			}, (err) => {
				console.log(err);
			}
		);
	}

	private fetchExperiences() {
		this.loadingExperiences = true;
		this._collectionService.fetchTrendingCollections('experience').subscribe(
			(collections: any) => {
				this.loadingExperiences = false;
				this.experiences = collections;
			}, (err) => {
				console.log(err);
			}
		);
	}

	private fetchBounties() {
		this.loadingBounties = true;
		this._collectionService.fetchTrendingCollections('bounty').subscribe(
			(collections: any) => {
				this.loadingBounties = false;
				this.bounties = collections;
			}, (err) => {
				console.log(err);
			}
		);
	}

	fetchCommunities() {
		const query = {
			'include': [
				{
					'relation': 'communities', 'scope': {
						'include': [
							'topics',
							'questions',
							'views',
							'invites',
							'rooms',
							{ 'collections': ['owners'] },
							'links',
							{ 'participants': [{ 'profiles': ['work'] }] },
							{ 'owners': [{ 'profiles': ['work'] }] }
						]
					}
				}
			],
			'order': 'createdAt desc'
		};
		this.loadingCommunities = true;
		this._topicService.getTopics(query).subscribe(
			(response: any) => {
				this.loadingCommunities = false;
				this.communities = [];
				for (const responseObj of response) {
					responseObj.communities.forEach(community => {
						if (community.status === 'active') {
							let totalGyan = 0;
							if (community.questions) {
								community.questions.forEach(question => {
									if (question.gyan !== undefined && question.gyan > 0) {
										totalGyan += parseInt(question.gyan, 10);
									}
								});
							}
							const participants = [];
							community.allParticipants = community.participants;
							if (community.participants) {
								community.participants.forEach((participant, index) => {
									if (index < 4) {
										participants.push(participant);
									}
								});
							}
							community.participants = participants;
							const topics = [];
							community.topics.forEach(topicObj => {
								topics.push(this.titlecasepipe.transform(topicObj.name));
							});
							if (topics.length > 0) {
								community.topics = topics;
							} else {
								topics.push('No topics selected');
								community.topics = topics;
							}
							community.gyan = totalGyan;
							this.communities.push(community);
						}
					});
				}
				this.communities = _.uniqBy(this.communities, 'id');
				this.communities = _.orderBy(this.communities, ['participants.length'], ['desc']);
				this.communities = _.chunk(this.communities, 5)[0];

			}, (err) => {
				console.log(err);
			}
		);

		const where = {
			'where': { 'type': 'experience' }
		};

		this._communityService.totalCommunititesCount().subscribe((res: any) => {
			this.communitiesCount = res.count;
			console.log(res);
		});

	}

	fetchQuestions() {
		this.loadingQuestions = true;
		const query = {
			'include': [
				'views',
				'topics',
				{ 'communities': ['owners', 'participants', 'topics'] },
				{ 'peer': 'profiles' },
				{ 'answers': [{ 'peer': 'profiles' }, { 'upvotes': { 'peer': 'profiles' } }, { 'comments': [{ 'peer': 'profiles' }, { 'replies': { 'peer': 'profiles' } }, { 'upvotes': 'peer' }] }, { 'views': 'peer' }, { 'flags': 'peer' }] },
				{ 'comments': [{ 'peer': 'profiles' }, { 'replies': { 'peer': 'profiles' } }, { 'upvotes': 'peer' }] },
				{ 'upvotes': { 'peer': 'profiles' } },
				{ 'views': 'peer' },
				{ 'flags': 'peer' },
				{ 'followers': 'profiles' }
			],
			'order': 'createdAt desc',
			'limit': 5
		};

		this._questionService.getQuestions(JSON.stringify(query)).subscribe(
			(response: any) => {
				this.questions = [];
				response.forEach(question => {
					const topics = [];
					if (question.communities && question.communities.length > 0) {
						question.communities.forEach(community => {
							community.topics.forEach(topicObj => {
								topics.push(this.titlecasepipe.transform(topicObj.name));
							});
						});
						if (topics.length > 0) {
							question.topics = topics;
						} else {
							topics.push('No topics selected');
							question.topics = topics;
						}
						question.community = question.communities[0];
						question.communityId = question.community.id;
					} else {
						if (question.topics && question.topics.length > 0) {
							const topicsArray = [];
							question.topics.forEach(topicObj => {
								if (topicObj.name) {
									topicsArray.push(this.titlecasepipe.transform(topicObj.name));
								}
							});
							question.topics = topicsArray;
						}
					}
					this.questions.push(question);
				});
				this.questions = _.orderBy(this.questions, ['views.length'], ['desc']);
				this.loadingQuestions = false;
			}, (err) => {
				console.log(err);
				this.loadingQuestions = false;
			}
		);
	}


	fetchPeers() {
		const query = {
			'include': [
				'profiles',
				'wallet'
			]
		};
		this.loadingPeers = true;
		this._profileService.fetchTrendingPeers(query).subscribe((result: any) => {
			this.peers = result;
			this.loadingPeers = false;
		}, (err) => {
			console.log(err);
		});
	}

	public onExperienceRefresh(event) {
		if (event) {
			this.fetchExperiences();
		}
	}

	public onBountyRefresh(event) {
		if (event) {
			this.fetchBounties();
		}
	}

	public onCommunityRefresh(event) {
		if (event) {
			this.fetchCommunities();
		}
	}

	public onQuestionRefresh(event) {
		if (event) {
			this.fetchQuestions();
		}
	}

	public onClassRefresh(event) {
		if (event) {
			this.fetchClasses();
		}
	}

	public openLogin() {
		this.dialogsService.openLogin().subscribe(
			res => {
				if (res) {
					this._router.navigate(['home', 'homefeed']);
				}
			}
		);
	}

	public onSearchOptionClicked(option) {
		this._searchService.onSearchOptionClicked(option);
		this.myControl.reset();
	}
	public createExperience() {
		this._router.navigate(['digest', 'experiences']);
	}

	public createClass() {
		this._router.navigate(['digest', 'classes']);
	}

	public createSession() {
		this._router.navigate(['digest', 'peers']);
	}

	public gotoCredit() {
		this.dialogsService.openLogin().subscribe((result: any) => {
			if (result) {
				this._router.navigateByUrl('/invite/1');
			}
		});
	}

	public openQuestionDialog() {
		this.dialogsService.askQuestion().subscribe(res => {
			if (res) {
				this.snackBar.open('Question has been added.', 'OK', { duration: 5000 });
			}
		});
	}

	private fetchGuides() {
		this.loadingGuides = true;
		this._collectionService.fetchTrendingCollections('guide').subscribe(
			(collections: any) => {
				this.guides = [];
				collections.forEach(collection => {
					const topics = [];
					collection.topics.forEach(topicObj => {
						topics.push(this.titlecasepipe.transform(topicObj.name));
					});
					if (topics.length > 0) {
						collection.topics = topics;
					} else {
						topics.push('No topics selected');
						collection.topics = topics;
					}
					this.guides.push(collection);
				});
				this.loadingGuides = false;
			}, (err) => {
				console.log(err);
			}
		);
	}

	public onBountiesRefresh(event) {
		if (event) {
			this.fetchBounties();
		}
	}

	public openBlog() {
		window.location.href = 'https://medium.com/theblockchainu';
	}

	public goToHome() {
		this._router.navigate(['/']);
	}
}
