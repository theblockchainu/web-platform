import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { map, flatMap } from 'rxjs/operators';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { AuthenticationService } from '../authentication/authentication.service';
@Injectable()
export class ProfileService {
	public key = 'userId';
	public envVariable;

	constructor(private http: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		public _requestHeaderService: RequestHeaderService,
		private _cookieUtilsService: CookieUtilsService,
		private _AuthenticationService: AuthenticationService
	) {
		this.envVariable = environment;
	}

	public getProfile(userId) {
		const profile = {};
		if (userId) {
			const filter = '{"include": [ {"peer":[{"reviewsByYou":{"reviewedPeer":"profiles"}},' +
				'{"reviewsAboutYou":{"peer":"profiles"}},{"collections":["calendars",{"participants":"profiles"},' +
				'{"contents":"schedules"},"topics"]},{"ownedCollections":["calendars",{"participants":["reviewsAboutYou",' +
				' "profiles"]},{"contents":"schedules"},"topics"]}, "topicsLearning", "topicsTeaching"]}, "work", "education"]}';
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/profiles?filter=' + filter, this._requestHeaderService.options)
				;
		}
	}

	public getProfileData(userId, filter: any) {
		if (userId) {
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/profiles?filter=' + JSON.stringify(filter), this._requestHeaderService.options);
		}
	}

	public getExternalProfileData(id: string, filter: any) {
		if (id) {
			return this.http.get(environment.apiUrl + '/api/peers/' + id + '/profiles?filter=' + JSON.stringify(filter), this._requestHeaderService.options)
				;
		}
	}

	/**
	 * getPeerData
	 */
	public getPeerData(userId, filter?: any): Observable<any> {
		if (filter) {
			if (userId) {
				return this.http.get(environment.apiUrl + '/api/peers/' + userId + '?filter=' + JSON.stringify(filter), this._requestHeaderService.options)
					;
			} else {
				return this.http.get(environment.apiUrl + '/api/peers/' + this._cookieUtilsService.getValue(this.key) + '?filter=' + JSON.stringify(filter), this._requestHeaderService.options)
					;
			}
		} else {
			if (userId) {
				return this.http.get(environment.apiUrl + '/api/peers/' + userId, this._requestHeaderService.options)
					;
			} else {
				return this.http.get(environment.apiUrl + '/api/peers/' + this._cookieUtilsService.getValue(this.key), this._requestHeaderService.options)
					;
			}
		}
	}
	public getCompactProfile(userId) {
		const profile = {};
		if (userId) {
			const filter = { 'include': [{ 'peer': ['ownedCollections', 'identities', 'credentials'] }, 'work', 'education', 'phone_numbers', 'emergency_contacts'] };
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/profiles?filter=' + JSON.stringify(filter), this._requestHeaderService.options)
				;
		} else {
			return new Observable(observer => {
				observer.next([]);
			});
		}
	}

	public changePassword(userId, oldPassword, newPassword) {
		if (userId) {
			const body = {
				userId: userId,
				oldPassword: oldPassword,
				newPassword: newPassword
			};
			return this.http
				.post(environment.apiUrl + '/api/peers/changePassword', body, this._requestHeaderService.options)
				;
		}
	}

	public setPassword(userId, newPassword) {
		if (userId) {
			const body = {
				userId: userId,
				newPassword: newPassword
			};
			return this.http
				.post(environment.apiUrl + '/api/peers/setPassword', body, this._requestHeaderService.options)
				;
		}
	}
	public updatePeer(userId, body: any) {
		if (userId) {
			return this.http.patch(environment.apiUrl + '/api/peers/' + userId, body, this._requestHeaderService.options);
		}
	}
	public updateProfile(userId, body: any) {
		if (userId) {
			return this.http.patch(environment.apiUrl + '/api/peers/' + userId + '/profile', body, this._requestHeaderService.options)
				.pipe(
					map((response: any) => {
						this._AuthenticationService.isLoginSubject.next(true);
						return response;
					})
				);
		}
	}

	public updatePeerProfile(userId, body: any) {
		if (userId) {
			return this.http.patch(environment.apiUrl + '/api/peers/' + userId + '/profile', body, this._requestHeaderService.options);
			// patch first_name, last_name, dob, promoOptIn into peers/id/profiles
		}
	}

	public socialProfiles(userId) {
		const socialProfile = [];
		if (userId) {
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/identities', this._requestHeaderService.options)
				;
		}
	}

	public interestTopics(userId, topicsFor) {
		const interestTopics = [];
		if (userId) {

			const topicsUrl = topicsFor === 'teacher' ? '/topicsTeaching' : '/topicsLearning';

			return this.http.get(environment.apiUrl + '/api/peers/' + userId + topicsUrl, this._requestHeaderService.options)
				;
		}
	}
	/* Signup Verification Methods Starts*/
	public getPeerNode(userId) {
		return this.http
			.get(environment.apiUrl + '/api/peers/' + userId, this._requestHeaderService.options);
	}

	public getScholarships(userId, filter) {
		return this.http
			.get(environment.apiUrl + '/api/peers/' + userId + '/scholarships_joined?filter=' + JSON.stringify(filter), this._requestHeaderService.options)
			;
	}


	public getKarmaBalance(userId, convertTo = 'KARMA') {
		return this.http
			.get(environment.apiUrl + '/api/peers/' + userId + '/karmaBalance?convertTo=' + convertTo, this._requestHeaderService.options)
			;
	}

	public getPotentialKarmaRewards(userId, convertTo = 'KARMA') {
		return this.http
			.get(environment.apiUrl + '/api/peers/' + userId + '/potentialRewards?convertTo=' + convertTo, this._requestHeaderService.options)
			;
	}

	public getGyanBalance(userId, type = 'floating', convertTo = 'GYAN') {
		if (type === 'fixed') {
			return this.http
				.get(environment.apiUrl + '/api/peers/' + userId + '/fixedGyanBalance?convertTo=' + convertTo, this._requestHeaderService.options)
				;
		} else {
			return this.http
				.get(environment.apiUrl + '/api/peers/' + userId + '/floatingGyanBalance?convertTo=' + convertTo, this._requestHeaderService.options)
				;
		}
	}

	public sendVerifyEmail(userId, emailAddress) {
		const body = {
		};
		return this.http
			.post(environment.apiUrl + '/api/peers/sendVerifyEmail?uid=' + userId + '&email=' + emailAddress, body, this._requestHeaderService.options)
			;

	}

	public sendVerifySms(phonenumber, countryCode) {
		const body = {
		};
		console.log(this._requestHeaderService.options);
		return this.http
			.post(environment.apiUrl + '/api/peers/sendVerifySms?phone=' + phonenumber + '&countryCode=' + countryCode, body, this._requestHeaderService.options)
			;

	}

	public confirmEmail(userId, inputToken: string) {
		const body = {};
		const redirect = 'verification';
		console.log(inputToken);
		return this.http
			.post(environment.apiUrl + '/api/peers/confirmEmail?uid=' + userId + '&token=' + inputToken + '&redirect=' + redirect, body, this._requestHeaderService.options)
			.pipe(
				map((response: any) => {
					this._AuthenticationService.isLoginSubject.next(true);
					return response;
				})
			);

	}

	public confirmSmsOTP(inputToken: string) {
		const body = {};
		return this.http
			.post(environment.apiUrl + '/api/peers/confirmSmsOTP?token=' + inputToken, body, this._requestHeaderService.options)
			;

	}
	/* Signup Verification Methods Ends*/

	public getSocialIdentities(query: any, peerId) {
		let url;
		if (query) {
			const filter = JSON.stringify(query);
			url = environment.apiUrl + '/api/peers/' + peerId + '?filter=' + filter;
		} else {
			url = environment.apiUrl + '/api/peers/' + peerId;
		}

		return this.http
			.get(url, this._requestHeaderService.options)
			;

	}

	/* get collections */
	public getCollections(userId, filter?: any) {
		if (userId) {
			if (filter) {
				return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections?filter=' + JSON.stringify(filter), this._requestHeaderService.options)
					;
			} else {
				return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections', this._requestHeaderService.options)
					;
			}
		}
	}

	public getReviews(userId, collectionId) {
		if (userId) {
			return this.http.get(environment.apiUrl + '/api/collections/' + collectionId + '/reviews', this._requestHeaderService.options)
				;
		}
	}
	public getOwnedCollectionCount(id) {
		if (id) {
			return this.http.get(environment.apiUrl + '/api/peers/' + id + '/ownedCollections/count', this._requestHeaderService.options)
				;
		}
	}
	public getReviewer(reviewId) {
		if (reviewId) {
			return this.http.get(environment.apiUrl + '/api/reviews/' + reviewId + '/peer', this._requestHeaderService.options)
				;
		}
	}

	public getEmailSubscriptions(filter: {}) {
		return this.http.get(environment.apiUrl + '/api/emailSubscriptions?filter=' + JSON.stringify(filter), this._requestHeaderService.options)
			;
	}

	/**
	 * Delete all work nodes of a profile
	 * @param profileId
	 * @param cb
	 */
	public deleteProfileWorks(profileId, cb) {
		this.http
			.delete(environment.apiUrl + '/api/profiles/' + profileId + '/work', this._requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	public deletePeer(peerId) {
		return this.http
			.delete(environment.apiUrl + '/api/peers/' + peerId, this._requestHeaderService.options)
			;
	}

	public updateWork(userId, profileId, work: any) {
		if (!(work.length > 0 && userId)) {
			console.log('User not logged in');
		} else {
			return this.http.delete(environment.apiUrl + '/api/profiles/' + profileId + '/work', this._requestHeaderService.options)
				.pipe(
					flatMap(
						(response: any) => {
							return this.http
								.post(environment.apiUrl + '/api/profiles/' + profileId + '/work', this.sanitize(work), this._requestHeaderService.options);
						}
					)
				);
		}
	}

	public updateEmergencyContact(userId, profileId, emergency_contact) {
		if (!(emergency_contact.length > 0 && userId)) {
			console.log('User not logged in');
		} else {
			return this.http.delete(environment.apiUrl + '/api/profiles/' + profileId + '/emergency_contacts', this._requestHeaderService.options)
				.pipe(
					flatMap(
						(response: any) => {
							return this.http
								.post(environment.apiUrl + '/api/profiles/' + profileId + '/emergency_contacts', this.sanitize(emergency_contact), this._requestHeaderService.options);
						}
					)
				);
		}
	}

	public updatePhoneNumbers(userId, profileId, phone_numbers) {
		if (!(phone_numbers.length > 0 && userId)) {
			console.log('User not logged in');
		} else {
			return this.http.delete(environment.apiUrl + '/api/profiles/' + profileId + '/phone_numbers', this._requestHeaderService.options)
				.pipe(flatMap(
					(response: any) => {
						return this.http
							.post(environment.apiUrl + '/api/profiles/' + profileId + '/phone_numbers', this.sanitize(phone_numbers), this._requestHeaderService.options);
					}
				));
		}
	}

	public updateProfileWorks(userId, profileId, work: any, cb: any) {
		if (!(work.length > 0 && userId)) {
			console.log('User not logged in');
			cb(new Error('User not logged in or work body blank'));
		} else {
			this.http
				.post(environment.apiUrl + '/api/profiles/' + profileId + '/work', this.sanitize(work), this._requestHeaderService.options)
				.subscribe((response1) => {
					cb(null, response1);
				}, (err) => {
					cb(err);
				});
		}
	}
	
	public addBillingAddress(userId, profileId, billingAddress: any) {
		return this.http
				.post(environment.apiUrl + '/api/profiles/' + profileId + '/billingaddress', this.sanitize(billingAddress), this._requestHeaderService.options);
	}

	/**
	 * Delete all education nodes of a profile
	 * @param profileId
	 * @param cb
	 */
	public deleteProfileEducations(profileId, cb) {
		this.http
			.delete(environment.apiUrl + '/api/profiles/' + profileId + '/education', this._requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	public updateProfileEducations(userId, profileId, education: any, cb: any) {
		if (!(education.length > 0 && userId)) {
			console.log('User not logged in');
			cb(new Error('User not logged in or education body blank'));
		} else {
			this.http
				.post(environment.apiUrl + '/api/profiles/' + profileId + '/education', this.sanitize(education), this._requestHeaderService.options)
				.subscribe((response1) => {
					cb(null, response1);
				}, (err) => {
					cb(err);
				});
		}
	}

	public updateEducation(userId, profileId, education: any) {
		if (!userId) {
			console.log('User not logged in');
		} else {
			return this.http.delete(environment.apiUrl + '/api/profiles/' + profileId + '/education', this._requestHeaderService.options)
				.pipe(
					flatMap((response: any) => {
						return this.http
							.post(environment.apiUrl + '/api/profiles/' + profileId + '/education', this.sanitize(education), this._requestHeaderService.options);
					})
				);
		}
	}
	/**
	 * sanitize
	 */
	public sanitize(object: any) {
		delete object.id;
		delete object.peer;
		delete object.work;
		delete object.education;
		return object;
	}

	/**
	 * getAllPeers
	 */
	public getAllPeers(query: any) {
		return this.http.get(environment.apiUrl + '/api/peers?filter=' + JSON.stringify(query), this._requestHeaderService.options);
	}

	/**
	 * getTopics
	 */
	public getLearningTopics(userId, query?: any) {
		if (query) {
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning?filter=' + JSON.stringify(query), this._requestHeaderService.options)
				;
		} else {
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning', this._requestHeaderService.options)
				;
		}

	}

	public getTeachingTopics(userId, query: any) {
		return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching?filter=' + JSON.stringify(query), this._requestHeaderService.options)
			;
	}

	public getTeachingExternalTopics(userId: string, query: any) {
		return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching?filter=' + JSON.stringify(query), this._requestHeaderService.options)
			;
	}
	/**
	 * unfollowTopic
	 */
	public unfollowTopic(userId, type, topicId: string) {
		if (type === 'learning') {
			return this.http.delete(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel/' + topicId, this._requestHeaderService.options);
		} else {
			return this.http.delete(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, this._requestHeaderService.options);
		}
	}

	public stopTeachingTopic(userId, topicId: string) {
		return this.http.delete(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, this._requestHeaderService.options);
	}
	/**
	 * followTopic
	 */
	public followTopic(userId, type, topicId: string, body?: any) {
		if (type === 'learning') {
			if (body) {
				return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel/' + topicId, body, this._requestHeaderService.options)
					;
			} else {
				return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel/' + topicId, {}, this._requestHeaderService.options)
					;
			}
		} else {
			if (body) {
				return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, body, this._requestHeaderService.options)
					;
			} else {
				return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, {}, this._requestHeaderService.options)
					;
			}
		}
	}

	public updateTeachingTopic(userId, topicId: string, body?: any) {
		if (body) {
			console.log(topicId + ' ' + body.experience);
			return this.http.delete(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, this._requestHeaderService.options)
				.pipe(flatMap((response: any) => {
					return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, body, this._requestHeaderService.options);
				}));
		} else {
			return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, {}, this._requestHeaderService.options)
				;
		}
	}


	public followMultipleTopicsLearning(userId, body: any) {
		return this.http.patch(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel', body, this._requestHeaderService.options)
			;
	}

	public followMultipleTopicsTeaching(userId, body: any) {
		return this.http.patch(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel', body, this._requestHeaderService.options)
			;
	}

	/**
	 * reportProfile
	 */
	public reportProfile(userId: string, body: any) {
		return this.http.post(environment.apiUrl + '/api/peers/' + userId + '/flags', body, this._requestHeaderService.options)
			;
	}

	/**
	 * approvePeer
	 */
	public approvePeer(peer: any) {
		return this.http.post(environment.apiUrl + '/api/peers/' + peer.id + '/approve', {}, this._requestHeaderService.options)
			;
	}

	/**
	 * approvePeer
	 */
	public rejectPeer(peer: any) {
		return this.http.post(environment.apiUrl + '/api/peers/' + peer.id + '/reject', {}, this._requestHeaderService.options)
			;
	}

	public getProfileProgressObject(profile: any): any {
		const profileObject = {
			'id': {
				'type': 'string',
				'id': true
			},
			'first_name': {
				'type': 'string'
			},
			'last_name': {
				'type': 'string'
			},
			'picture_url': {
				'type': 'string'
			},
			'headline': {
				'type': 'string'
			},
			'joining_date': {
				'type': 'date'
			},
			'preferred_language': {
				'type': 'string',
				'default': 'english'
			},
			'other_languages': {
				'type': [
					'string'
				]
			},
			'currency': {
				'type': 'string',
				'default': 'usd'
			},
			'gender': {
				'type': 'string'
			},
			'timezone': {
				'type': 'string',
				'default': 'pst'
			},
			'dobMonth': {
				'type': 'string'
			},
			'dobYear': {
				'type': 'number'
			},
			'dobDay': {
				'type': 'number'
			},
			'location_string': {
				'type': 'string'
			},
			'location_lat': {
				'type': 'string'
			},
			'location_lng': {
				'type': 'string'
			},
			'portfolio_url': {
				'type': 'string'
			},
			'is_teacher': {
				'type': 'boolean',
				'default': false
			},
			'description': {
				'type': 'string'
			},
			'education': {
				'type': 'string'
			},
			'work_experience': {
				'type': 'string'
			},
			'custom_url': {
				'type': 'string'
			},
			'vat_number': {
				'type': 'string'
			}
		};

		const peerObject = {
			'id': {
				'type': 'string',
				'required': true
			},
			'username': {
				'type': 'string'
			},
			'ethAddress': {
				'type': 'string'
			},
			'ethKeyStore': {
				'type': 'string'
			},
			'email': {
				'type': 'string'
			},
			'phone': {
				'type': 'number'
			},
			'phoneVerified': {
				'type': 'boolean',
				'default': false
			},
			'emailVerified': {
				'type': 'boolean',
				'default': false
			},
			'phoneVerificationToken': {
				'type': 'string'
			},
			'verificationToken': {
				'type': 'string'
			},
			'verificationTokenTime': {
				'type': 'string'
			},
			'accountVerified': {
				'type': 'boolean',
				'default': false
			},
			'verificationIdUrl': {
				'type': 'string'
			},
			'isAdmin': {
				'type': 'boolean',
				'default': false
			}
		};
		console.log(profile);
		const pProg = {
			personal: false,
			additional: false,
			photos: false,
			verification: false,
			progress: 0,
			pending: []
		};
		let progress = 0;
		let totalKeys = 0;
		for (const key in profileObject) {
			if (key === 'id' || key === 'joining_date' || key === 'is_teacher'
				|| key === 'promoOptIn' || key === 'onboardingStage' || key === 'custom_url'
				|| key === 'createdAt' || key === 'updatedAt' || key === 'other_languages' || key === 'location_string'
				|| key === 'location_lat' || key === 'location_lng' || key === 'portfolio_url'
				|| key === 'vat_number' || key === 'emergency_contacts' || key === 'peer') {
			} else {
				totalKeys++;
				if (profile.hasOwnProperty(key)) {
					if (profile[key] && (profile[key] === true || profile[key] > 0 || profile[key].length > 0)) {
						progress++;
					} else {
						pProg['pending'].push(key);
					}
				} else {
					pProg['pending'].push(key);
				}
			}

		}

		for (const key in peerObject) {
			if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'isAdmin'
				|| key === 'ownedCollections' || key === 'identities' || key === 'credentials'
				|| key === 'ethAddress' || key === 'ethKeyStore' || key === 'phone' || key === 'phoneVerificationToken'
				|| key === 'verificationToken' || key === 'verificationTokenTime' || key === 'accountVerified') {
			} else {
				totalKeys++;
				if (profile.peer[0].hasOwnProperty(key)) {
					if (profile.peer[0][key] && (profile.peer[0][key] === true || profile.peer[0][key] > 0 || profile.peer[0][key].length > 0)) {
						progress++;
					} else {
						pProg['pending'].push(key);
					}
				} else {
					pProg['pending'].push(key);
				}
			}
		}


		if (profile.first_name && profile.last_name && profile.headline && profile.gender
			&& profile.dobDay && profile.dobMonth && profile.dobYear && profile.currency) {
			pProg['personal'] = true;
		}
		if (profile.work && profile.work.length > 0 && profile.education && profile.education.length > 0
			&& profile.vat_number && profile.phones && profile.phones.length > 0 && profile.location_string
			&& profile.preferred_language && profile.emergency_contacts && profile.emergency_contacts.length > 0) {
			pProg['additional'] = true;
		}
		if (profile.picture_url) {
			pProg['photos'] = true;
		}
		if (profile.peer[0].phoneVerified && profile.peer[0].phone && profile.peer[0].emailVerified
			&& profile.peer[0].email && profile.peer[0].accountVerified && profile.peer[0].verificationIdUrl) {
			pProg['verification'] = true;
		}

		pProg['progress'] = Math.round((progress / totalKeys) * 100);
		return pProg;
	}

	/**
	 * viewProfile
	 */
	public viewProfile(peer) {
		this.router.navigate(['profile', peer.id]);
	}

	/**
	 * getBookmarks
	 */
	public getBookmarks(userId: string, query: any, cb) {
		const filter = JSON.stringify(query);
		this.http
			.get(environment.apiUrl + '/api/peers/' + userId + '/bookmarks' + '?filter=' + filter, this._requestHeaderService.options)
			.subscribe((response: any) => {
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

	public imgErrorHandler(event) {
		event.target.src = '/assets/images/user-placeholder.jpg';
	}

	public getJoinedCommunities(peerId: string, filter: any) {
		return this.http.get(environment.apiUrl + '/api/peers/' + peerId + '/communities?filter=' + JSON.stringify(filter), this._requestHeaderService.options);
	}

	/**
	 * getAccreditations
	 */
	public getAccreditationsCreated(peerId: string, filter: any) {
		return this.http.get(environment.apiUrl + '/api/peers/' + peerId + '/accreditationsCreated?filter=' + JSON.stringify(filter), this._requestHeaderService.options);
	}

	public getAccreditationsSubscribed(peerId: string, filter: any) {
		return this.http.get(environment.apiUrl + '/api/peers/' + peerId + '/accreditationsSubscribed?filter=' + JSON.stringify(filter), this._requestHeaderService.options);
	}

	public linkPromoCode(peerId: string, promoCodeId: string) {
		return this.http.put(environment.apiUrl + '/api/peers/' + peerId + '/promoCodesApplied/rel/' + promoCodeId, {}, this._requestHeaderService.options);
	}
}
