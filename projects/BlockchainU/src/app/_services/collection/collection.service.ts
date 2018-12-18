import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { flatMap, first } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { map } from 'rxjs/operators';
declare var moment: any;

@Injectable()
export class CollectionService {
	public key = 'userId';
	public now: Date;
	public envVariable;
	constructor(
		private httpClient: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		private authService: AuthenticationService,
		private requestHeaderService: RequestHeaderService,
		private cookieUtilsService: CookieUtilsService
	) {
		this.envVariable = environment;
		this.now = new Date();
	}

	public getCollection(userId, type: string, cb) {
		const collections = [];
		if (userId) {
			this.httpClient
				.get(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections', this.requestHeaderService.options)
				.subscribe(
					(response: any) => {
						const responseObj = response;
						console.log(response);
						responseObj.forEach((res: any) => {
							if (res.type === type) {
								collections.push(res);
							}
						});
						cb(null, collections);
					}, (err) => {
						cb(err);
					}
				);
		}
	}

	public getOwnedCollections(userId, options: string, cb) {
		if (userId) {
			this.httpClient
				.get(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections?' + 'filter=' + options, this.requestHeaderService.options)
				.subscribe(res => {
					cb(null, res);
				}, err => {
					cb(err);
				});
		}
	}

	public getOwnedCollectionCount(userId, options: string, cb) {
		if (userId) {
			this.httpClient
				.get(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections/count?filter=' + options, this.requestHeaderService.options)
				.subscribe(res => {
					cb(null, res);
				}, err => {
					cb(err);
				});
		}
	}

	public getTotalCollectionCount(property: string, value: string) {
		return this.httpClient.get(environment.apiUrl + '/api/collections/count?where[' + property + '][like]=' + value, this.requestHeaderService.options);
	}

	public getParticipatingCollections(userId, options: any, cb) {
		if (userId) {
			this.httpClient
				.get(environment.apiUrl + '/api/peers/' + userId + '/collections?' + 'filter=' + options, this.requestHeaderService.options)
				.subscribe((response: any) => {
					console.log(response);
					cb(null, response);
				}, (err) => {
					cb(err);
				});
		} else {
			cb(null, []);
		}
	}

	public getAllCollections(options: any) {
		return this.httpClient
			.get(environment.apiUrl + '/api/collections?' + 'filter=' + JSON.stringify(options), this.requestHeaderService.options);
	}

	public getCollectionDetails(id: string) {
		return this.httpClient
			.get(environment.apiUrl + '/api/collections/' + id, this.requestHeaderService.options);

	}

	public getCollectionDetail(id: string, param: any) {
		const filter = JSON.stringify(param);
		return this.httpClient
			.get(environment.apiUrl + '/api/collections/' + id + '?filter=' + filter, this.requestHeaderService.options);
	}

	public getCollectionEthereumInfo(id: string, param: any) {
		const filter = JSON.stringify(param);
		return this.httpClient
			.get(environment.apiUrl + '/api/collections/' + id + '/ether?filter=' + filter, this.requestHeaderService.options);

	}

	public getParticipantEthereumInfo(id: string, fk: string) {
		return this.httpClient
			.get(environment.apiUrl + '/api/collections/' + id + '/peers/' + fk + '/ether', this.requestHeaderService.options);

	}

	public addToEthereum(id: string) {
		const body = {};
		return this.httpClient
			.post(environment.apiUrl + '/api/collections/' + id + '/ether', body, this.requestHeaderService.options);
	}

	public addParticipantToEthereum(id: string, participantId: string) {
		const body = {};
		return this.httpClient
			.post(environment.apiUrl + '/api/collections/' + id + '/peers/' + participantId + '/ether', body, this.requestHeaderService.options);
	}

	/**
	 * postCollection
	 */
	public postCollection(userId, type: string) {
		const body = {
			'type': type
		};
		return this.httpClient.post(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections', body, this.requestHeaderService.options);
	}

	/**
	 * postCollection
	 */
	public postCollectionWithData(userId, data: any) {
		return this.httpClient.post(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections', data, this.requestHeaderService.options);
	}

	/**
	 * patchCollection
	 */
	public patchCollection(collectionId: string, body: any) {
		return this.httpClient.patch(environment.apiUrl + '/api/collections/' + collectionId, body, this.requestHeaderService.options);
	}

	/**
	 * patchCalendar
	 */
	public patchCalendar(calendarId: string, body: any) {
		return this.httpClient.patch(environment.apiUrl + '/api/calendars/' + calendarId, body, this.requestHeaderService.options);
	}

	/**
	 * deleteCollection
	 */
	public deleteCollection(collectionId: string) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId, this.requestHeaderService.options);
	}

	/**
	 * delete Calendar
	 */
	public deleteCalendar(calendarId: string) {
		return this.httpClient.delete(environment.apiUrl + '/api/calendars/' + calendarId, this.requestHeaderService.options);
	}

	/**
	 * sanitize
	 */
	public sanitize(collection: any) {
		delete collection.id;
		delete collection.createdAt;
		delete collection.isApproved;
		delete collection.isCanceled;
		delete collection.options;
		delete collection.status;
		delete collection.updatedAt;
		return collection;
	}

	/**
	 * removeParticipant
	 */
	public removeParticipant(collectionId: string, participantId: string) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/participants/rel/' + participantId, this.requestHeaderService.options);
	}
	/* Submit class for Review */
	public submitForReview(id: string) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + id + '/submitForReview', {}, this.requestHeaderService.options);
	}
	/**
	 * Filter only complete collections
	 * @param collections
	 */
	public filerCompleteCollections(collections: any) {
		return collections.filter(collection => {
			return collection.status === 'complete';
		});
	}

	/**
	 * calculateTotalHours
	 */
	public calculateTotalHours(collection) {
		let totalLength = 0;
		if (collection.contents) {
			collection.contents.forEach(content => {
				if (content.type === 'online') {
					const startMoment = moment(content.schedules[0].startTime);
					const endMoment = moment(content.schedules[0].endTime);
					const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
					totalLength += parseInt(contentLength, 10);
				} else if (content.type === 'video') {

				}
			});
		}
		return totalLength.toString();
	}

	/**
	 * calculate number of days of a class
	 */
	public calculateNumberOfDays(calendar) {
		if (calendar === undefined) {
			return 'No Calendar';
		} else {
			const a = moment(calendar.startDate);
			const b = moment(calendar.endDate);
			return b.diff(a, 'days') + 1;
		}
	}

	/**
	 * Get difference in days
	 */
	public getDaysBetween(startDate, endDate) {
		const a = moment(startDate);
		const b = moment(endDate);
		const diff = b.diff(a, 'days');
		switch (true) {
			case diff === -1:
				return 'tomorrow';
			case diff < 0 && diff > -7:
				return 'in ' + Math.abs(diff) + ' days';
			case diff <= -7 && diff > -30:
				return 'in ' + Math.abs(Math.floor(diff / 7)) + ' weeks';
			case diff <= -30 && diff > -365:
				return 'in ' + Math.abs(Math.floor(diff / 30)) + ' months';
			case diff <= -365:
				return 'in ' + Math.abs(Math.floor(diff / 365)) + ' years';
			case diff === 0:
				return 'today';
			case diff === 1:
				return 'yesterday';
			case diff > 1 && diff < 7:
				return diff + ' days ago';
			case diff >= 7 && diff < 30:
				return Math.floor(diff / 7) + ' weeks ago';
			case diff >= 30 && diff < 365:
				return Math.floor(diff / 30) + ' months ago';
			case diff >= 365:
				return Math.floor(diff / 365) + ' years ago';
			default:
				return diff + ' days ago';
		}
	}

	/**
	 * Get the most upcoming content details
	 */
	public getUpcomingEvent(collection) {
		const contents = collection.contents;
		const calendars = collection.calendars;
		const currentCalendar = this.getCurrentCalendar(calendars);
		contents.sort((a, b) => {
			if (a.schedules[0].startDay < b.schedules[0].startDay) {
				return -1;
			}
			if (a.schedules[0].startDay > b.schedules[0].startDay) {
				return 1;
			}
			return 0;
		}).filter((element, index) => {
			return moment() < moment(element.startDay);
		});
		let fillerWord = '';
		if (contents[0] && currentCalendar) {
			if (contents[0].type === 'online') {
				fillerWord = 'activity';
			} else if (contents[0].type === 'video') {
				fillerWord = 'recording';
			} else if (contents[0].type === 'in-person') {
				fillerWord = 'activity';
			} else if (contents[0].type === 'project') {
				fillerWord = 'submission';
			}
			const contentStartDate = moment(currentCalendar.startDate).add(contents[0].schedules[0].startDay, 'days');
			const timeToStart = contentStartDate.diff(moment(), 'days');
			contents[0].timeToStart = timeToStart;
			contents[0].fillerWord = fillerWord;
			contents[0].hasStarted = false;
			return contents[0];
		} else {
			return null;
		}
	}

	/**
	 * Get the full name of any content type
	 * @param contentType
	 * @returns {string}
	 */
	public getContentTypeFullName(contentType) {
		let fillerWord = '';
		if (contentType === 'online') {
			fillerWord = 'session';
		} else if (contentType === 'video') {
			fillerWord = 'recording';
		} else if (contentType === 'in-person') {
			fillerWord = 'session';
		} else if (contentType === 'project') {
			fillerWord = 'submission';
		}
		return contentType + ' ' + fillerWord;
	}

	/**
	 * Get the current active calendar of this collection
	 * @param calendars
	 */
	public getCurrentCalendar(calendars) {
		if (calendars && calendars !== undefined) {
			calendars = calendars.sort((a, b) => {
				if (moment(a.startDate) < moment(b.startDate)) {
					return -1;
				}
				if (moment(a.startDate) > moment(b.startDate)) {
					return 1;
				}
				return 0;
			}).filter((element, index) => {
				return moment() < moment(element.endDate);
			});
			return calendars[0];
		} else {
			return null;
		}
	}

	/**
	 * Get the upcoming active calendar of this collection
	 * @param calendars
	 */
	public getUpcomingCalendar(calendars) {
		calendars = calendars.sort((a, b) => {
			if (moment(a.startDate) < moment(b.startDate)) {
				return -1;
			}
			if (moment(a.startDate) > moment(b.startDate)) {
				return 1;
			}
			return 0;
		}).filter((element, index) => {
			return moment() < moment(element.startDate);
		});
		return calendars[0];
	}

	/**
	 * Get the progress bar value of this class
	 * @param class
	 * @returns {number}
	 */
	public getProgressValue(collection) {
		let value = 0;
		switch (collection.status) {
			case 'draft':
				if (collection.title !== undefined && collection.title.length > 0) {
					value += 10;
				}
				if (collection.headline !== undefined && collection.headline.length > 0) {
					value += 10;
				}
				if (collection.description !== undefined && collection.description.length > 0) {
					value += 10;
				}
				if (collection.videoUrls !== undefined && collection.videoUrls.length > 0) {
					value += 10;
				}
				if (collection.imageUrls !== undefined && collection.imageUrls.length > 0) {
					value += 10;
				}
				if (collection.price !== undefined && collection.price.length > 0) {
					value += 10;
				}
				if (collection.aboutHost !== undefined && collection.aboutHost.length > 0) {
					value += 10;
				}
				if (collection.cancellationPolicy !== undefined && collection.cancellationPolicy.length > 0) {
					value += 10;
				}
				if (collection.contents !== undefined && collection.contents.length > 0) {
					value += 10;
				}
				if (collection.topics !== undefined && collection.topics.length > 0) {
					value += 10;
				}
				return value;
			case 'active':
				let startDate;
				const calendarLength = collection.calendars.length;
				if (calendarLength > 1) {
					startDate = this.getCurrentCalendar(collection.calendars) !==
						undefined ? this.getCurrentCalendar(collection.calendars).startDate : this.now;
				} else if (calendarLength === 1) {
					startDate = collection.calendars[0];
				}
				if (startDate > this.now) {
					return 0;
				}
				const totalContents = calendarLength;
				let pendingContents = 0;
				collection.contents.forEach((content) => {
					if (moment(startDate).add(content.schedules[0].startDay, 'days') > this.now) {
						pendingContents++;
					}
				});
				return (1 - (pendingContents / totalContents)) * 100;
			case 'submitted':
				return 100;
			case 'complete':
				return 100;
			default:
				return 0;
		}
	}

	/**
	 * viewCollection
	 */
	public viewCollection(collection) {
		this.openCollection(collection);
	}

	/**
	 *  Edit Class
	 */
	public openEditClass(collection) {
		this.router.navigate(['class', collection.id, 'edit', collection.stage.length > 0 ? collection.stage : 1]);
	}

	/**
	 * Edit experience
	 */
	public openEditExperience(collection) {
		this.router.navigate(['experience', collection.id, 'edit', collection.stage.length > 0 ? collection.stage : 1]);
	}

	/**
	 * editCollection
	 */
	public openEditCollection(collection) {
		this.router.navigate([collection.type, collection.id, 'edit', collection.stage.length > 0 ? collection.stage : 1]);
	}

	/**
	 * viewSession
	 */
	public openEditSession(collection) {
		this.router.navigate(['session', collection.id, 'edit', collection.stage.length > 0 ? collection.stage : 1]);
	}

	/**
	 * Get text to show in action button of draft card
	 * @param status
	 * @returns {any}
	 */
	public getDraftButtonText(status) {
		switch (status) {
			case 'draft':
				return 'Continue Editing';
			case 'submitted':
				return 'Edit Details';
			default:
				return 'Continue Editing';
		}
	}

	/**
	 * View all transactions for this teacher
	 */
	public viewTransactions() {
		this.router.navigate(['/console/account/transactions']);
	}

	public sendVerifySMS(phoneNo, countryCode) {
		const body = {};
		return this.httpClient
			.post(environment.apiUrl + '/api/peers/sendVerifySms?phone=' + phoneNo + '&countryCode=' + countryCode, body, this.requestHeaderService.options);
	}


	public confirmSmsOTP(inputToken) {
		const body = {};
		return this.httpClient
			.post(environment.apiUrl + '/api/peers/confirmSmsOTP?token=' + inputToken, body, this.requestHeaderService.options);

	}

	public saveBookmark(collectionId, cb) {
		const body = {};
		this.httpClient
			.post(environment.apiUrl + '/api/collections/' + collectionId + '/bookmarks', body, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	public removeBookmark(bookmarkId, cb) {
		const body = {};
		this.httpClient
			.delete(environment.apiUrl + '/api/bookmarks/' + bookmarkId, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	/**
	 * getBookmarks
	 */
	public getBookmarks(collectionId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.httpClient
			.get(environment.apiUrl + '/api/collections/' + collectionId + '/bookmarks' + '?filter=' + filter, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	/**
	 * getRecommendations
	 */
	public getRecommendations(query) {
		const filter = JSON.stringify(query);
		return this.httpClient
			.get(environment.apiUrl + '/api/collections?' + 'filter=' + filter, this.requestHeaderService.options);
	}

	/**
	 * getParticipants
	 */
	public getParticipants(collectionId, query?) {
		if (query) {
			const filter = JSON.stringify(query);
			return this.httpClient
				.get(environment.apiUrl + '/api/collections/' + collectionId + '/participants?filter=' + filter, this.requestHeaderService.options);
		} else {
			return this.httpClient
				.get(environment.apiUrl + '/api/collections/' + collectionId + '/participants', this.requestHeaderService.options);
		}
	}

	/**
	 * addParticipant
	 collectionID:string,userId:string,calendarId:string   */
	public addParticipant(collectionId: string, userId: string, calendarId?: string, scholarshipId?: string, referrerId?: string) {
		const body = {
			'calendarId': calendarId ? calendarId : false,
			'scholarshipId': scholarshipId ? scholarshipId : false,
			'referrerId': referrerId ? referrerId : false
		};
		console.log(body);
		return this.httpClient
			.put(environment.apiUrl + '/api/collections/' + collectionId + '/participants/rel/' + userId, body, this.requestHeaderService.options);
	}

	public linkCommunityToCollection(communityId, collectionId, cb) {
		this.httpClient
			.put(environment.apiUrl + '/api/communities/' + communityId + '/collections/rel/' + collectionId, {}, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}


	/**
	 * Approve this collection
	 * @param collection
	 * @returns {Observable<any>}
	 */
	public approveCollection(collection) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collection.id + '/approve', {}, this.requestHeaderService.options);
	}

	/**
	 * Approve this collection
	 * @param collection
	 * @returns {Observable<any>}
	 */
	public rejectCollection(collection) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collection.id + '/reject', {}, this.requestHeaderService.options);
	}

	/**
	 * open a collection view page based on its type
	 * @param collection
	 */
	public openCollection(collection) {
		console.log(collection);
		switch (collection.type) {
			case 'class':
				if (collection.customUrl && collection.customUrl.length > 0) {
					this.router.navigate(['/class', collection.customUrl]);
				} else {
					this.router.navigate(['/class', collection.id]);
				}
				break;
			case 'experience':
				if (collection.customUrl && collection.customUrl.length > 0) {
					this.router.navigate(['/experience', collection.customUrl]);
				} else {
					this.router.navigate(['/experience', collection.id]);
				}
				break;
			case 'session':
				this.router.navigate(['/session', collection.id]);
				break;
			case 'bounty':
				this.router.navigate(['/bounty', collection.id]);
				break;
			case 'guide':
				if (collection.customUrl && collection.customUrl.length > 0) {
					this.router.navigate(['/guide', collection.customUrl]);
				} else {
					this.router.navigate(['/guide', collection.id]);
				}
				break;
			case 'learning-path':
				if (collection.customUrl && collection.customUrl.length > 0) {
					this.router.navigate(['/learning-path', collection.customUrl]);
				} else {
					this.router.navigate(['/learning-path', collection.id]);
				}
				break;
			default:
				break;
		}
	}

	public postCalendars(id, calendars) {
		return this.httpClient
			.post(environment.apiUrl + '/api/collections/' + id + '/calendars', calendars, this.requestHeaderService.options);
	}

	/**
	 * getComments
	 */
	public getComments(classId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.httpClient
			.get(environment.apiUrl + '/api/collections/' + classId + '/comments' + '?filter=' + filter, this.requestHeaderService.options)
			.subscribe(
				(response: any) => {
					cb(null, response);
				}, (err) => {
					cb(err);
				}
			);
	}

	/**
	 * get comments of given content
	 * @param {string} contentId
	 * @param query
	 * @param cb
	 */
	public getContentComments(contentId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.httpClient
			.get(environment.apiUrl + '/api/contents/' + contentId + '/comments' + '?filter=' + filter, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	/**
	 * get comments of given submission
	 * @param {string} submissionId
	 * @param query
	 * @param cb
	 */
	public getSubmissionComments(submissionId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.httpClient
			.get(environment.apiUrl + '/api/submissions/' + submissionId + '/comments' + '?filter=' + filter, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	public getReviews(peerId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.httpClient
			.get(environment.apiUrl + '/api/peers/' + peerId + '/reviewsAboutYou' + '?filter=' + filter, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	/**
	 * postComments
	 worrkshopID   */
	public postComments(classId: string, commentBody: any, cb) {
		this.httpClient
			.post(environment.apiUrl + '/api/collections/' + classId + '/comments', commentBody, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	/**
	 * Post a comment on submission
	 * @param {string} submissionId
	 * @param commentBody
	 * @param cb
	 */
	public postSubmissionComments(submissionId: string, commentBody: any, cb) {
		this.httpClient
			.post(environment.apiUrl + '/api/submissions/' + submissionId + '/comments', commentBody, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	/**
	 * post a comment on content
	 * @param {string} contentId
	 * @param commentBody
	 * @param cb
	 */
	public postContentComments(contentId: string, commentBody: any, cb) {
		this.httpClient
			.post(environment.apiUrl + '/api/contents/' + contentId + '/comments', commentBody, this.requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	/**
	 * postReview
	 */
	public postReview(peerId: string, reviewBody: any) {
		return this.httpClient
			.post(environment.apiUrl + '/api/peers/' + peerId + '/reviewsAboutYou', reviewBody, this.requestHeaderService.options);
	}

	public updateReview(reviewId: string, reviewBody: any) {
		return this.httpClient
			.patch(environment.apiUrl + '/api/reviews/' + reviewId, reviewBody, this.requestHeaderService.options);
	}

	public calculateRating(reviewArray?: any) {
		if (reviewArray && reviewArray.length > 0) {
			let reviewScore = 0;
			for (const reviewObject of reviewArray) {
				reviewScore += reviewObject.score;
			}
			return (reviewScore / (reviewArray.length * 5)) * 5;
		} else {
			return 0;
		}
	}

	public calculateCollectionRating(collectionId, reviewArray?: any) {
		let reviewScore = 0;
		for (const reviewObject of reviewArray) {
			if (reviewObject.collectionId !== undefined && reviewObject.collectionId === collectionId) { reviewScore += reviewObject.score; }
		}
		return (reviewScore / (reviewArray.length * 5)) * 5;
	}

	public calculateCollectionRatingCount(collectionId, reviewArray?: any) {
		let reviewCount = 0;
		for (const reviewObject of reviewArray) {
			if (reviewObject.collectionId !== undefined && reviewObject.collectionId === collectionId) { reviewCount++; }
		}
		return reviewCount;
	}

	public imgErrorHandler(event) {
		event.target.src = '/assets/images/placeholder-image.jpg';
	}

	public topicImgErrorHandler(event) {
		event.target.src = '/assets/images/topic-placeholder.jpg';
	}

	public userImgErrorHandler(event) {
		event.target.src = '/assets/images/user-placeholder.jpg';
	}

	public landscapeErrorHandler(event) {
		event.target.src = '/assets/images/community-banner-bg.jpg';
	}

	/**
	 * deleteComment
	 */
	public deleteReview(reviewId: string) {
		return this.httpClient
			.delete(environment.apiUrl + '/api/reviews/' + reviewId, this.requestHeaderService.options);
	}


	public calculateItenaries(_class: any, currentCalendar: any) {
		const itenariesObj = {};
		const itenaryArray = [];
		_class.contents.forEach(contentObj => {
			if (itenariesObj.hasOwnProperty(contentObj.schedules[0].startDay)) {
				itenariesObj[contentObj.schedules[0].startDay].push(contentObj);
			} else {
				itenariesObj[contentObj.schedules[0].startDay] = [contentObj];
			}
		});
		console.log(itenariesObj);
		for (const key in itenariesObj) {
			if (itenariesObj.hasOwnProperty(key)) {
				let startDate, endDate;
				if (currentCalendar) {
					startDate = this.calculateDate(currentCalendar.startDate, key);
					endDate = this.calculateDate(currentCalendar.startDate, key);
				} else {
					startDate = this.calculateDate(_class.calendars[0].startDate, key);
					endDate = this.calculateDate(_class.calendars[0].startDate, key);
				}
				itenariesObj[key].sort(function (a, b) {
					return parseFloat(a.schedules[0].startTime) - parseFloat(b.schedules[0].startTime);
				});
				itenariesObj[key].forEach(content => {
					if (content.schedules[0].startTime !== undefined) {
						content.schedules[0].startTime = startDate.format().toString().split('T')[0]
							+ 'T' + content.schedules[0].startTime.split('T')[1];
						content.schedules[0].endTime = startDate.format().toString().split('T')[0]
							+ 'T' + content.schedules[0].endTime.split('T')[1];
					}
				});
				const itenary = {
					startDay: key,
					startDate: startDate,
					endDate: endDate,
					contents: itenariesObj[key]
				};
				itenaryArray.push(itenary);
			}
		}
		itenaryArray.sort(function (a, b) {
			return parseFloat(a.startDay) - parseFloat(b.startDay);
		});
		return itenaryArray;
	}

	/**
	 * calculateDate
	 */
	public calculateDate(fromdate, day) {
		const tempMoment = moment(fromdate);
		tempMoment.add(day, 'days');
		return tempMoment;
	}

	/**
	 * markPresence for a peer in content rsvp
	 */
	public markPresence(peerId, rsvpId, isPresent) {
		const body = {
			'isPresent': isPresent
		};
		return this.httpClient
			.put(environment.apiUrl + '/api/peers/' + peerId + '/rsvps/' + rsvpId, body, this.requestHeaderService.options);
	}

	public updateProvisions(collectionId: string, body: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/provisions', this.requestHeaderService.options)
			.pipe(
				flatMap(res => {
					return this.httpClient
						.post(environment.apiUrl + '/api/collections/' + collectionId + '/provisions', body, this.requestHeaderService.options);
				})
			);

	}

	public postPackages(collectionId: string, body: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/packages', this.requestHeaderService.options)
			.pipe(
				flatMap(res => {
					return this.httpClient
						.post(environment.apiUrl + '/api/collections/' + collectionId + '/packages', body, this.requestHeaderService.options)
						;
				})
			);
	}

	public patchPreferences(collectionId: string, body: any) {
		return this.httpClient.get(environment.apiUrl + '/api/collections/' + collectionId + '/preferences', this.requestHeaderService.options)
			.pipe(
				flatMap((preferences: any) => {
					if (preferences && preferences.length > 0) {
						console.log(preferences);
						return this.httpClient.patch(environment.apiUrl + '/api/preferences/' + preferences[0].id, body, this.requestHeaderService.options);
					} else {
						return this.httpClient
							.post(environment.apiUrl + '/api/collections/' + collectionId + '/preferences', body, this.requestHeaderService.options);
					}
				})
			);
	}

	public updateAvailability(collectionId: string, body: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/availability', this.requestHeaderService.options)
			.pipe(
				flatMap(
					res => {
						return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/availability', body, this.requestHeaderService.options);
					}
				)
			);
	}

	public deleteAvailability(collectionId: string, availabilityId: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/availability/' + availabilityId, this.requestHeaderService.options);
	}

	public addAvailability(collectionId: string, body: any) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/availability', body, this.requestHeaderService.options);
	}

	private randomIdGenerator() {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}

	public postAvailability(userId: string, collectionId: string, availabilities: Array<any>, approval: boolean, packageId: string) {
		const contentObjs = [];
		const paymentBatchId = this.randomIdGenerator();
		availabilities.forEach(() => {
			contentObjs.push({
				type: 'session',
				title: 'Peer Session',
				sessionIsApproved: approval,
				paymentBatch: paymentBatchId
			});
		});
		const availabilityLinkRequestArray = [];
		const peerLinkRequestArray = [];
		const packageLinkRequestArray = [];
		let contents;
		const contentArray = [];
		// Create Content nodes for the session request (can be split into multiple content nodes if time is not contiguous)
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/contents', contentObjs, this.requestHeaderService.options)
			.pipe(
				flatMap((res: any) => {
					contents = res;
					contents.forEach((savedContent, index) => {
						contentArray.push(savedContent);
						const targetIds = [];
						// Each of the created content node is linked to all of the Availabilities (time slots) of that request
						availabilities[index].forEach(element => {
							availabilityLinkRequestArray.push(
								this.httpClient.put(environment.apiUrl + '/api/contents/' + savedContent.id + '/availabilities/rel/' + element.id, {}, this.requestHeaderService.options)
							);
						});
						// The created content nodes are linked to the logged In user as the owner of this request
						peerLinkRequestArray.push(
							this.httpClient.put(environment.apiUrl + '/api/peers/' + userId + '/contents/rel/' + savedContent.id, {}, this.requestHeaderService.options)
						);
						// The created content nodes are linked to the package selected by this user.
						packageLinkRequestArray.push(
							this.httpClient.put(environment.apiUrl + '/api/contents/' + savedContent.id + '/packages/rel/' + packageId, {}, this.requestHeaderService.options)
						);
					});
					return forkJoin(availabilityLinkRequestArray);
				}),
				flatMap(res => {
					return forkJoin(peerLinkRequestArray);
				}),
				flatMap(res => {
					return forkJoin(packageLinkRequestArray);
				}),
				map(res => {
					return {
						contentArray: contentArray,
						paymentBatchId: paymentBatchId
					};
				}));
	}

	public approveSessionJoinRequest(sessionId) {
		const body = { 'sessionIsApproved': true };
		return this.httpClient.patch(environment.apiUrl + '/api/contents/' + sessionId, body, this.requestHeaderService.options);
	}

	public rejectSessionJoinRequest(sessionId) {
		const body = { 'sessionIsRejected': true };
		return this.httpClient.patch(environment.apiUrl + '/api/contents/' + sessionId, body, this.requestHeaderService.options);
	}

	public updateComment(commentId: string, commentBody: any) {
		return this.httpClient
			.patch(environment.apiUrl + '/api/comments/' + commentId, commentBody, this.requestHeaderService.options);
	}

	public updateAssessmentModel(collectionId: string, assessmentModelObject: any) {
		return this.httpClient.get(environment.apiUrl + '/api/collections/' + collectionId + '/assessment_models', this.requestHeaderService.options)
			.pipe(
				flatMap(res => {
					const assessmentModels = <any>res;
					if (assessmentModels.length < 1) {
						return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/assessment_models', assessmentModelObject, this.requestHeaderService.options);
					} else {
						return this.httpClient.patch(environment.apiUrl + '/api/assessment_models/' + assessmentModels[0].id, assessmentModelObject, this.requestHeaderService.options);
					}
				})
			);
	}

	public updateAssessmentRules(assessmentModelId: string, assessmentRulesArray: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/assessment_models/' + assessmentModelId + '/assessment_rules', this.requestHeaderService.options)
			.pipe(flatMap(res => {
				return this.httpClient.post(environment.apiUrl + '/api/assessment_models/' + assessmentModelId + '/assessment_rules', assessmentRulesArray, this.requestHeaderService.options);
			}));
	}

	public updateNAAssessmentRules(assessmentModelId: string, assessmentNARulesArray: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/assessment_models/' + assessmentModelId + '/assessment_na_rules', this.requestHeaderService.options)
			.pipe(
				flatMap(res => {
					return this.httpClient.post(environment.apiUrl + '/api/assessment_models/' + assessmentModelId + '/assessment_na_rules', assessmentNARulesArray, this.requestHeaderService.options);
				})
			);
	}

	public getKarmaToBurn(gyan: number) {
		return this.httpClient.post(environment.apiUrl + '/getKarmaToBurn', {
			gyan: gyan
		}, this.requestHeaderService.options);
	}

	public unlinkTopic(experienceId, topicId) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + experienceId + '/topics/rel/' + topicId, this.requestHeaderService.options);
	}

	public linkTopics(experienceId, body) {
		return this.httpClient.patch(environment.apiUrl + '/api/collections/' + experienceId + '/topics/rel', body, this.requestHeaderService.options);
	}

	public submitCertificate(experienceId: string, body: any) {
		return this.httpClient.patch(environment.apiUrl + '/api/collections/' + experienceId + '/certificate_template', body, this.requestHeaderService.options);
	}

	public addPromoCode(collectionId: string, promoCodeObj: any) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/promoCodes', promoCodeObj, this.requestHeaderService.options);
	}

	public getPromoCodes(collectionId: string, filter: any) {
		return this.httpClient.get(environment.apiUrl + '/api/collections/' + collectionId + '/promoCodes?filter=' + JSON.stringify(filter), this.requestHeaderService.options);
	}

	public addRewards(collectionId: string, rewardsArray: Array<any>) {
		console.log(rewardsArray);
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/rewards', this.requestHeaderService.options).pipe(
			flatMap(res => {
				return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/rewards', rewardsArray, this.requestHeaderService.options);
			})
		);
	}

	public linkPeertoReward(rewardId: string, participantId: string) {
		return this.httpClient
			.get(environment.apiUrl + '/api/rewards/' + rewardId +
				'/winners', this.requestHeaderService.options)
			.pipe(
				flatMap((res: any) => {
					const delinkRequestArray = [];
					if (res.length > 0) {
						res.forEach(peer => {
							delinkRequestArray.push(
								this.httpClient.delete(environment.apiUrl + '/api/rewards/' + rewardId +
									'/winners/rel/' + peer.id, this.requestHeaderService.options)
							);
						});
						return forkJoin(delinkRequestArray);
					} else {
						return new Observable(observer => {
							observer.next();
						});
					}
				}), flatMap(res => {
					return this.httpClient
						.put(environment.apiUrl + '/api/rewards/' + rewardId +
							'/winners/rel/' + participantId, {}, this.requestHeaderService.options);
				})
			);

	}

	public unlinkPeerFromRewards(rewardsArray: Array<string>, participantId: string, ) {
		if (rewardsArray.length > 0) {
			const unlinkPeerArray = [];
			rewardsArray.forEach((rewardId: string) => {
				unlinkPeerArray.push(
					this.httpClient
						.delete(environment.apiUrl + '/api/rewards/' + rewardId +
							'/winners/rel/' + participantId, this.requestHeaderService.options)
				);
			});
			return forkJoin(unlinkPeerArray);
		} else {
			return new Observable(observer => {
				observer.next();
			});
		}

	}

	public announceResult(collectionId: string) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId +
			'/announceResult', {}, this.requestHeaderService.options);
	}

	public saveRefferedBY(referrerId: string) {
		console.log('saving referred by');
		this.cookieUtilsService.deleteValue('referrerId');
		this.cookieUtilsService.setValue('referrerId', referrerId);
	}

	public fetchTrendingCollections(type: string) {
		return this.httpClient
			.get(environment.apiUrl + '/api/collections/trending?type=' + type,
				this.requestHeaderService.options).pipe(map((collections: Array<any>) => {
					console.log(collections);
					return collections.map(item => JSON.parse(item));
				}));

	}

	public postContent(collectionId: string, content: any) {
		return this.httpClient
			.post(environment.apiUrl + '/api/collections/' + collectionId + '/contents', content,
				this.requestHeaderService.options);
	}

	public updateContentQuestions(contentId, questions: any) {
		if (!(questions.length > 0)) {
			console.log('User not logged in');
		} else {
			return this.httpClient.delete(environment.apiUrl + '/api/contents/' + contentId + '/questions', this.requestHeaderService.options)
				.pipe(
					flatMap(
						(response: any) => {
							return this.httpClient
								.post(environment.apiUrl + '/api/contents/' + contentId + '/questions', this.sanitize(questions), this.requestHeaderService.options);
						}
					)
				);
		}
	}

	public postAnswers(questionId: string, answer: any) {
		return this.httpClient
			.post(environment.apiUrl + '/api/content_questions/' + questionId + '/answers', answer, this.requestHeaderService.options);
	}

	public notifyOwnerForQuizSubmission(questionId: string) {
		return this.httpClient
			.post(environment.apiUrl + '/api/content_questions/' + questionId + '/notifyOwner', {}, this.requestHeaderService.options);
	}

	public getPreferences(filter) {
		return this.httpClient.get(environment.apiUrl + '/api/preferences?filter=' + JSON.stringify(filter), this.requestHeaderService.options);
	}

	/**
	 * patchAnswer
	 */
	public patchAnswer(answerId: string, body: any) {
		return this.httpClient.patch(environment.apiUrl + '/api/content_answers/' + answerId, body, this.requestHeaderService.options);
	}
}
