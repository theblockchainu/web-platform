import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
declare var moment: any;

@Injectable()
export class CollectionService {
	public key = 'userId';
	public options;
	public now: Date;
	public envVariable;
	constructor(
		private httpClient: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		private authService: AuthenticationService,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
		this.options = requestHeaderService.getOptions();
		this.now = new Date();
	}
	
	public getCollection(userId, type: string, cb) {
		const collections = [];
		if (userId) {
			this.httpClient
				.get(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections')
				.subscribe(
					(response: any) => {
						const responseObj = response;
						console.log(response);
						responseObj.forEach((res) => {
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
				.get(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections?' + 'filter=' + options)
				.subscribe(res => {
					cb(null, res);
				}, err => {
					cb(err);
				});
		}
	}
	
	public getParticipatingCollections(userId, options: any, cb) {
		if (userId) {
			this.httpClient
				.get(environment.apiUrl + '/api/peers/' + userId + '/collections?' + 'filter=' + options)
				.map((response) => {
					console.log(response);
					cb(null, response);
				}, (err) => {
					cb(err);
				}).subscribe();
		}
	}
	
	public getAllCollections(options: any) {
		return this.httpClient
			.get(environment.apiUrl + '/api/collections?' + 'filter=' + JSON.stringify(options))
			.map(response => response);
	}
	
	public getCollectionDetails(id: string) {
		return this.httpClient
			.get(environment.apiUrl + '/api/collections/' + id)
			.map((response: any) => response, (err) => {
				console.log('Error: ' + err);
			});
		
	}
	
	public getCollectionDetail(id: string, param: any) {
		const filter = JSON.stringify(param);
		return this.httpClient
			.get(environment.apiUrl + '/api/collections/' + id + '?filter=' + filter)
			.map((response: any) => response, (err) => {
				console.log('Error: ' + err);
			});
		
	}
	
	/**
	 * postCollection
	 */
	public postCollection(userId, type: string) {
		const body = {
			'type': type
		};
		return this.httpClient.post(environment.apiUrl + '/api/peers/'
			+ userId + '/ownedCollections', body, this.options).map(
			(response) => response, (err) => {
				console.log('Error: ' + err);
			}
		);
	}
	
	/**
	 * postCollection
	 */
	public postCollectionWithData(userId, data: any) {
		return this.httpClient.post(environment.apiUrl + '/api/peers/'
			+ userId + '/ownedCollections', data, this.options).map(
			(response) => response, (err) => {
				console.log('Error: ' + err);
			}
		);
	}
	
	/**
	 * patchCollection
	 */
	public patchCollection(collectionId: string, body: any) {
		return this.httpClient.patch(environment.apiUrl +
			'/api/collections/' + collectionId, body, this.options);
	}
	
	/**
	 * patchCalendar
	 */
	public patchCalendar(calendarId: string, body: any) {
		return this.httpClient.patch(environment.apiUrl +
			'/api/calendars/' + calendarId, body, this.options);
	}
	
	/**
	 * deleteCollection
	 */
	public deleteCollection(collectionId: string) {
		return this.httpClient.delete(environment.apiUrl +
			'/api/collections/' + collectionId);
	}
	
	/**
	 * delete Calendar
	 */
	public deleteCalendar(calendarId: string) {
		return this.httpClient.delete(environment.apiUrl +
			'/api/calendars/' + calendarId);
	}
	
	/**
	 * sanitize
	 */
	public sanitize(collection: any) {
		delete collection.id;
		delete collection.createdAt;
		delete collection.isApproved;
		delete collection.isCanceled;
		delete collection.status;
		delete collection.updatedAt;
		return collection;
	}
	
	/**
	 * removeParticipant
	 */
	public removeParticipant(collectionId: string, participantId: string) {
		return this.httpClient.delete(environment.apiUrl +
			'/api/collections/' + collectionId + '/participants/rel/' + participantId);
	}
	/* Submit workshop for Review */
	public submitForReview(id: string) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + id + '/submitForReview', {}, this.options).map(
			(response) => response, (err) => {
				console.log('Error: ' + err);
			});
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
	 * calculate number of days of a workshop
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
		if (contents[0]) {
			if (contents[0].type === 'online') {
				fillerWord = 'session';
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
	}
	
	/**
	 * Get the progress bar value of this workshop
	 * @param workshop
	 * @returns {number}
	 */
	public getProgressValue(workshop) {
		let value = 0;
		switch (workshop.status) {
			case 'draft':
				if (workshop.title !== undefined && workshop.title.length > 0) {
					value += 10;
				}
				if (workshop.headline !== undefined && workshop.headline.length > 0) {
					value += 10;
				}
				if (workshop.description !== undefined && workshop.description.length > 0) {
					value += 10;
				}
				if (workshop.videoUrls !== undefined && workshop.videoUrls.length > 0) {
					value += 10;
				}
				if (workshop.imageUrls !== undefined && workshop.imageUrls.length > 0) {
					value += 10;
				}
				if (workshop.price !== undefined && workshop.price.length > 0) {
					value += 10;
				}
				if (workshop.aboutHost !== undefined && workshop.aboutHost.length > 0) {
					value += 10;
				}
				if (workshop.cancellationPolicy !== undefined && workshop.cancellationPolicy.length > 0) {
					value += 10;
				}
				if (workshop.contents !== undefined && workshop.contents.length > 0) {
					value += 10;
				}
				if (workshop.topics !== undefined && workshop.topics.length > 0) {
					value += 10;
				}
				return value;
			case 'active':
				let startDate;
				const calendarLength = workshop.calendars.length;
				if (calendarLength > 1) {
					startDate = this.getCurrentCalendar(workshop.calendars) !==
					undefined ? this.getCurrentCalendar(workshop.calendars).startDate : this.now;
				} else if (calendarLength === 1) {
					startDate = workshop.calendars[0];
				}
				if (startDate > this.now) {
					return 0;
				}
				const totalContents = calendarLength;
				let pendingContents = 0;
				workshop.contents.forEach((content) => {
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
	 *  Workshop
	 */
	public viewWorkshop(collection) {
		this.router.navigate(['workshop', collection.id]);
	}
	
	/**
	 * viewExperience
	 */
	public viewExperience(collection) {
		this.router.navigate(['experience', collection.id]);
	}
	
	/**
	 * viewCollection
	 */
	public viewCollection(collection) {
		this.router.navigate([collection.type, collection.id]);
	}
	
	/**
	 * viewSession
	 */
	public viewSession(collection) {
		this.router.navigate(['session', collection.id]);
	}
	
	/**
	 *  Edit Workshop
	 */
	public openEditWorkshop(collection) {
		this.router.navigate(['workshop', collection.id, 'edit', collection.stage.length > 0 ? collection.stage : 1]);
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
			.post(environment.apiUrl + '/api/peers/sendVerifySms?phone=' + phoneNo + '&countryCode=' + countryCode, body, this.options)
			.map((response: any) => response, (err) => {
				console.log('Error: ' + err);
			});
	}
	
	
	public confirmSmsOTP(inputToken) {
		const body = {};
		return this.httpClient
			.post(environment.apiUrl + '/api/peers/confirmSmsOTP?token=' + inputToken, body, this.options)
			.map((response: any) => response, (err) => {
				console.log('Error: ' + err);
			});
		
	}
	
	public saveBookmark(collectionId, cb) {
		const body = {};
		this.httpClient
			.post(environment.apiUrl + '/api/collections/' + collectionId + '/bookmarks', body, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	public removeBookmark(bookmarkId, cb) {
		const body = {};
		this.httpClient
			.delete(environment.apiUrl + '/api/bookmarks/' + bookmarkId, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	/**
	 * getBookmarks
	 */
	public getBookmarks(collectionId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.httpClient
			.get(environment.apiUrl + '/api/collections/' + collectionId + '/bookmarks' + '?filter=' + filter, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	/**
	 * getRecommendations
	 */
	public getRecommendations(query) {
		const filter = JSON.stringify(query);
		return this.httpClient
			.get(environment.apiUrl + '/api/collections?' + 'filter=' + filter, this.options);
	}
	
	/**
	 * getParticipants
	 */
	public getParticipants(collectionId, query) {
		const filter = JSON.stringify(query);
		return this.httpClient
			.get(environment.apiUrl + '/api/collections/' + collectionId + '/participants?filter=' + filter, this.options);
	}
	
	/**
	 * addParticipant
	 collectionID:string,userId:string,calendarId:string   */
	public addParticipant(collectionId: string, userId: string, calendarId: string, cb) {
		const body = {
			'calendarId': calendarId
		};
		this.httpClient
			.put(environment.apiUrl + '/api/collections/' + collectionId + '/participants/rel/' + userId, body, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	public linkCommunityToCollection(communityId, collectionId, cb) {
		this.httpClient
			.put(environment.apiUrl + '/api/communities/' + communityId + '/collections/rel/' + collectionId, {}, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	
	/**
	 * Approve this collection
	 * @param collection
	 * @returns {Observable<any>}
	 */
	public approveCollection(collection) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collection.id + '/approve', {}, this.options).map(
			(response) => response, (err) => {
				console.log('Error: ' + err);
			});
	}
	
	/**
	 * open a collection view page based on its type
	 * @param collection
	 */
	public openCollection(collection) {
		console.log(collection);
		switch (collection.type) {
			case 'workshop':
				this.router.navigate(['/workshop', collection.id]);
				break;
			case 'experience':
				this.router.navigate(['/experience', collection.id]);
				break;
			case 'session':
				this.router.navigate(['/session', collection.id]);
				break;
			default:
				this.router.navigate(['/workshop', collection.id]);
				break;
		}
	}
	
	public postCalendars(id, calendars) {
		return this.httpClient
			.post(environment.apiUrl + '/api/collections/' + id + '/calendars', calendars, this.options)
			.map((response: any) => response, (err) => {
				console.log('Error: ' + err);
			});
	}
	
	/**
	 * getComments
	 */
	public getComments(workshopId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.httpClient
			.get(environment.apiUrl + '/api/collections/' + workshopId + '/comments' + '?filter=' + filter, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
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
			.get(environment.apiUrl + '/api/contents/' + contentId + '/comments' + '?filter=' + filter, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
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
			.get(environment.apiUrl + '/api/submissions/' + submissionId + '/comments' + '?filter=' + filter, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	public getReviews(peerId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.httpClient
			.get(environment.apiUrl + '/api/peers/' + peerId + '/reviewsAboutYou' + '?filter=' + filter, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	/**
	 * postComments
	 worrkshopID   */
	public postComments(workshopId: string, commentBody: any, cb) {
		this.httpClient
			.post(environment.apiUrl + '/api/collections/' + workshopId + '/comments', commentBody, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	/**
	 * Post a comment on submission
	 * @param {string} submissionId
	 * @param commentBody
	 * @param cb
	 */
	public postSubmissionComments(submissionId: string, commentBody: any, cb) {
		this.httpClient
			.post(environment.apiUrl + '/api/submissions/' + submissionId + '/comments', commentBody, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	/**
	 * post a comment on content
	 * @param {string} contentId
	 * @param commentBody
	 * @param cb
	 */
	public postContentComments(contentId: string, commentBody: any, cb) {
		this.httpClient
			.post(environment.apiUrl + '/api/contents/' + contentId + '/comments', commentBody, this.options)
			.map((response) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			}).subscribe();
	}
	
	/**
	 * postReview
	 */
	public postReview(peerId: string, reviewBody: any) {
		return this.httpClient
			.post(environment.apiUrl + '/api/peers/' + peerId + '/reviewsAboutYou', reviewBody, this.options);
	}
	
	public updateReview(reviewId: string, reviewBody: any) {
		return this.httpClient
			.patch(environment.apiUrl + '/api/reviews/' + reviewId, reviewBody, this.options);
	}
	
	public calculateRating(reviewArray?: any) {
		let reviewScore = 0;
		for (const reviewObject of reviewArray) {
			reviewScore += reviewObject.score;
		}
		return (reviewScore / (reviewArray.length * 5)) * 5;
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
	
	public userImgErrorHandler(event) {
		event.target.src = '/assets/images/user-placeholder.jpg';
	}
	
	/**
	 * deleteComment
	 */
	public deleteReview(reviewId: string) {
		return this.httpClient
			.delete(environment.apiUrl + '/api/reviews/' + reviewId, this.options);
	}
	
	
	public calculateItenaries(workshop: any, currentCalendar: any) {
		const itenariesObj = {};
		const itenaryArray = [];
		workshop.contents.forEach(contentObj => {
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
					startDate = this.calculateDate(workshop.calendars[0].startDate, key);
					endDate = this.calculateDate(workshop.calendars[0].startDate, key);
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
			.put(environment.apiUrl + '/api/peers/' + peerId + '/rsvps/' + rsvpId, body, this.options)
			.map((response: any) => response);
	}
	
	public updateProvisions(collectionId: string, body: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/provisions', this.options).flatMap(res => {
			return this.httpClient
				.post(environment.apiUrl + '/api/collections/' + collectionId + '/provisions', body, this.options)
				.map((response: any) => response);
		});
		
	}
	
	public postPackages(collectionId: string, body: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/packages', this.options).flatMap(res => {
			console.log('deleted');
			console.log('posting', body);
			return this.httpClient
				.post(environment.apiUrl + '/api/collections/' + collectionId + '/packages', body, this.options)
				.map((response: any) => response);
		});
	}
	
	public postPreferences(collectionId: string, body: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/preferences', this.options).flatMap(res => {
			console.log('deleted');
			console.log('posting', body);
			return this.httpClient
				.post(environment.apiUrl + '/api/collections/' + collectionId + '/preferences', body, this.options)
				.map((response: any) => response);
		});
	}
	
	public updateAvailability(collectionId: string, body: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/availability').flatMap(
			res => {
				return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/availability', body, this.options)
					.map((response: any) => response);
			}
		);
	}
	
	public deleteAvailability(collectionId: string, availabilityId: any) {
		return this.httpClient.delete(environment.apiUrl + '/api/collections/' + collectionId + '/availability/' + availabilityId);
	}
	
	public addAvailability(collectionId: string, body: any) {
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/availability', body, this.options)
			.map((response: any) => response);
	}
	
	public postAvailability(userId: string, collectionId: string, availabilities: Array<any>, approval: boolean, packageId: string) {
		const contentObjs = [];
		availabilities.forEach(() => {
			contentObjs.push({
				type: 'session',
				title: 'Peer Session',
				sessionIsApproved: approval
			});
		});
		const availabilityLinkRequestArray = [];
		const peerLinkRequestArray = [];
		const packageLinkRequestArray = [];
		let contents;
		const contentArray = [];
		// Create Content nodes for the session request (can be split into multiple content nodes if time is not contiguous)
		return this.httpClient.post(environment.apiUrl + '/api/collections/' + collectionId + '/contents', contentObjs, this.options)
			.flatMap((res: any) => {
				contents = res;
				contents.forEach((savedContent, index) => {
					contentArray.push(savedContent);
					const targetIds = [];
					// Each of the created content node is linked to all of the Availabilities (time slots) of that request
					availabilities[index].forEach(element => {
						availabilityLinkRequestArray.push(
							this.httpClient.put(environment.apiUrl + '/api/contents/'
								+ savedContent.id + '/availabilities/rel/' + element.id, this.options)
						);
					});
					// The created content nodes are linked to the logged In user as the owner of this request
					peerLinkRequestArray.push(
						this.httpClient.put(environment.apiUrl + '/api/peers/' + userId + '/contents/rel/' + savedContent.id, this.options)
					);
					// The created content nodes are linked to the package selected by this user.
					packageLinkRequestArray.push(
						this.httpClient.put(environment.apiUrl + '/api/contents/' + savedContent.id + '/packages/rel/' + packageId, this.options)
					);
				});
				return forkJoin(availabilityLinkRequestArray);
			}).flatMap(res => {
				return forkJoin(peerLinkRequestArray);
			}).flatMap(res => {
				return forkJoin(packageLinkRequestArray);
			}).flatMap(res => {
				return contentArray;
			});
	}
	
	public approveSessionJoinRequest(sessionId) {
		const body = { 'sessionIsApproved': true };
		return this.httpClient.patch(environment.apiUrl + '/api/contents/' + sessionId, body, this.options).map(res => res);
	}
	
	public rejectSessionJoinRequest(sessionId) {
		const body = { 'sessionIsRejected': true };
		return this.httpClient.patch(environment.apiUrl + '/api/contents/' + sessionId, body, this.options).map(res => res);
	}
	
	public updateComment(commentId: string, commentBody: any) {
		return this.httpClient
			.patch(environment.apiUrl + '/api/comments/' + commentId, commentBody, this.options);
	}
	
}
