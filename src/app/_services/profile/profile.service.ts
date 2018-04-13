import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
@Injectable()
export class ProfileService {
  public key = 'userId';
  private options;
  public profileSubject = new Subject<any>();
  public envVariable;

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router,
    public _requestHeaderService: RequestHeaderService,
    private _cookieUtilsService: CookieUtilsService
  ) {
    this.envVariable = environment;
    this.options = this._requestHeaderService.getOptions();
  }

  public getPeer(id) {
    const peer = {};
    if (id) {
      const options = `{"where": "","order": "","limit": "",
      "include": [{"profiles":["work","education"]}, "topicsLearning","topicsTeaching",
      {"collections":{"reviews": {"peer": "profiles"}}},
      {"ownedCollections":[{"reviews":{"peer":"profiles"}},
      "calendars",{"contents":"schedules"}]},"communities","identities"]}`;
      return this.http.get(environment.apiUrl + '/api/peers/' + id + '?filter=' + options, this.options)
        .map((response: any) => response);
    }
  }

  public getProfile(userId) {
    const profile = {};
    if (userId) {
      const filter = '{"include": [ {"peer":[{"reviewsByYou":{"reviewedPeer":"profiles"}},' +
        '{"reviewsAboutYou":{"peer":"profiles"}},{"collections":["calendars",{"participants":"profiles"},' +
        '{"contents":"schedules"},"topics"]},{"ownedCollections":["calendars",{"participants":["reviewsAboutYou",' +
        ' "profiles"]},{"contents":"schedules"},"topics"]}, "topicsLearning", "topicsTeaching"]}, "work", "education"]}';
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/profiles?filter=' + filter, this.options)
        .map(
          (response: any) => response
        );
    }
  }

  public getProfileData(userId, filter: any) {
    if (userId) {
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/profiles?filter=' + JSON.stringify(filter), this.options)
        .map(
          (response: any) => response
        );
    }
  }

  public getExternalProfileData(id: string, filter: any) {
    if (id) {
      return this.http.get(environment.apiUrl + '/api/peers/' + id + '/profiles?filter=' + JSON.stringify(filter), this.options)
        .map(
          (response: any) => response
        );
    }
  }

  /**
   * getPeerData
   */
  public getPeerData(userId, filter?: any): Observable<any> {
    if (filter) {
      if (userId) {
        return this.http.get(environment.apiUrl + '/api/peers/' + userId + '?filter=' + JSON.stringify(filter), this.options)
          .map(
            (response: any) => response
          );
      } else {
        return this.http.get(environment.apiUrl + '/api/peers/' +
          this._cookieUtilsService.getValue(this.key) + '?filter=' + JSON.stringify(filter), this.options)
          .map(
            (response: any) => response
          );
      }
    } else {
      if (userId) {
        return this.http.get(environment.apiUrl + '/api/peers/' + userId, this.options)
          .map(
            (response: any) => response
          );
      } else {
        return this.http.get(environment.apiUrl + '/api/peers/' + this._cookieUtilsService.getValue(this.key), this.options)
          .map(
            (response: any) => response
          );
      }
    }
  }
  public getCompactProfile(userId) {
    const profile = {};
    if (userId) {
      const filter = { 'include': [{ 'peer': 'ownedCollections' }, 'work', 'education', 'phone_numbers', 'emergency_contacts'] };
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/profiles?filter=' + JSON.stringify(filter), this.options)
        .map(
          (response: any) => response
        );
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
        .post(environment.apiUrl + '/api/peers/changePassword', body, this.options)
        .map((response: any) => response, (err) => {
          console.log('Error: ' + err);
        });
    }
  }

  public updatePeer(userId, body: any) {
    if (userId) {
      return this.http.patch(environment.apiUrl + '/api/peers/' + userId, body, this.options).map(
        response => response
      );
    }
  }
  public updateProfile(userId, body: any) {
    if (userId) {
      return this.http.patch(environment.apiUrl + '/api/peers/' + userId + '/profile', body, this.options)
        .map((response: any) => {
          this.profileSubject.next('updated');
          return response;
        });
    }
  }

  public updatePeerProfile(userId, body: any) {
    if (userId) {
      return this.http.patch(environment.apiUrl + '/api/peers/' + userId + '/profile', body, this.options);
      // patch first_name, last_name, dob, promoOptIn into peers/id/profiles
    }
  }

  public socialProfiles(userId) {
    const socialProfile = [];
    if (userId) {
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/identities', this.options)
        .map((response: any) => response
        );
    }
  }

  public interestTopics(userId, topicsFor) {
    const interestTopics = [];
    if (userId) {

      const topicsUrl = topicsFor === 'teacher' ? '/topicsTeaching' : '/topicsLearning';

      return this.http.get(environment.apiUrl + '/api/peers/' + userId + topicsUrl, this.options)
        .map((response: any) => response
        );
    }
  }
  /* Signup Verification Methods Starts*/
  public getPeerNode(userId) {
    return this.http
      .get(environment.apiUrl + '/api/peers/' + userId)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });
  }

  public sendVerifyEmail(userId, emailAddress) {
    const body = {
    };
    return this.http
      .post(environment.apiUrl + '/api/peers/sendVerifyEmail?uid=' + userId + '&email=' + emailAddress, body, this.options)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });

  }
  public sendVerifySms(phonenumber, countryCode) {
    const body = {
    };
    return this.http
      .post(environment.apiUrl + '/api/peers/sendVerifySms?phone=' + phonenumber + '&countryCode=' + countryCode, body, this.options)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });

  }

  public confirmEmail(userId, inputToken: string) {
    const body = {};
    const redirect = 'onboarding';
    console.log(inputToken);
    return this.http
      .post(environment.apiUrl + '/api/peers/confirmEmail?uid=' + userId +
        '&token=' + inputToken + '&redirect=' + redirect, body, this.options)
      .map((response: any) => response);

  }

  public confirmSmsOTP(inputToken: string) {
    const body = {};
    return this.http
      .post(environment.apiUrl + '/api/peers/confirmSmsOTP?token=' + inputToken, body, this.options)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });

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
      .get(url, this.options)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });

  }

  /* get collections */
  public getCollections(userId, filter?: any) {
    if (userId) {
      if (filter) {
        return this.http.get(environment.apiUrl + '/api/peers/' + userId
          + '/ownedCollections?filter=' + JSON.stringify(filter), this.options)
          .map((response: any) => response, (err) => {
            console.log('Error: ' + err);
          });
      } else {
        return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/ownedCollections', this.options)
          .map((response: any) => response, (err) => {
            console.log('Error: ' + err);
          });
      }
    }
  }

  public getReviews(userId, collectionId) {
    if (userId) {
      // console.log(collections);
      // const reviews: any = [];
      //  collections.forEach(collection => {
      return this.http.get(environment.apiUrl + '/api/collections/' + collectionId + '/reviews', this.options)
        .map((response: any) => response);
    }
  }
  public getOwnedCollectionCount(id) {
    if (id) {
      return this.http.get(environment.apiUrl + '/api/peers/' + id + '/ownedCollections/count', this.options)
        .map((response: any) => response);
    }
  }
  public getReviewer(reviewId) {
    if (reviewId) {
      return this.http.get(environment.apiUrl + '/api/reviews/' + reviewId + '/peer', this.options)
        .map((response: any) => response);
    }
  }

  /**
   * Delete all work nodes of a profile
   * @param profileId
   * @param cb
   */
  public deleteProfileWorks(profileId, cb) {
    this.http
      .delete(environment.apiUrl + '/api/profiles/' + profileId + '/work', this.options)
      .map((response) => {
        cb(null, response);
      }, (err) => {
        cb(err);
      }).subscribe();
  }

  public updateWork(userId, profileId, work: any) {
    if (!(work.length > 0 && userId)) {
      console.log('User not logged in');
    } else {
      return this.http.delete(environment.apiUrl + '/api/profiles/' + profileId + '/work', this.options)
        .flatMap(
          (response) => {
            return this.http
              .post(environment.apiUrl + '/api/profiles/' + profileId + '/work', this.sanitize(work), this.options);
          }
        ).map((response) => response);
    }
  }

  public updateEmergencyContact(userId, profileId, emergency_contact) {
    if (!(emergency_contact.length > 0 && userId)) {
      console.log('User not logged in');
    } else {
      return this.http.delete(environment.apiUrl + '/api/profiles/' + profileId + '/emergency_contacts', this.options)
        .flatMap(
          (response) => {
            return this.http
              .post(environment.apiUrl + '/api/profiles/' + profileId +
                '/emergency_contacts', this.sanitize(emergency_contact), this.options);
          }
        ).map((response) => response);
    }
  }

  public updatePhoneNumbers(userId, profileId, phone_numbers) {
    if (!(phone_numbers.length > 0 && userId)) {
      console.log('User not logged in');
    } else {
      return this.http.delete(environment.apiUrl + '/api/profiles/' + profileId + '/phone_numbers', this.options)
        .flatMap(
          (response) => {
            return this.http
              .post(environment.apiUrl + '/api/profiles/' + profileId + '/phone_numbers', this.sanitize(phone_numbers), this.options);
          }
        ).map((response) => response);
    }
  }

  public updateProfileWorks(userId, profileId, work: any, cb: any) {
    if (!(work.length > 0 && userId)) {
      console.log('User not logged in');
      cb(new Error('User not logged in or work body blank'));
    } else {
      this.http
        .post(environment.apiUrl + '/api/profiles/' + profileId + '/work', this.sanitize(work), this.options)
        .map((response1) => {
          cb(null, response1);
        }, (err) => {
          cb(err);
        }).subscribe();
    }
  }

  /**
   * Delete all education nodes of a profile
   * @param profileId
   * @param cb
   */
  public deleteProfileEducations(profileId, cb) {
    this.http
      .delete(environment.apiUrl + '/api/profiles/' + profileId + '/education', this.options)
      .map((response) => {
        cb(null, response);
      }, (err) => {
        cb(err);
      }).subscribe();
  }

  public updateProfileEducations(userId, profileId, education: any, cb: any) {
    if (!(education.length > 0 && userId)) {
      console.log('User not logged in');
      cb(new Error('User not logged in or education body blank'));
    } else {
      this.http
        .post(environment.apiUrl + '/api/profiles/' + profileId + '/education', this.sanitize(education), this.options)
        .map((response1) => {
          cb(null, response1);
        }, (err) => {
          cb(err);
        }).subscribe();
    }
  }

  public updateEducation(userId, profileId, education: any) {
    if (!userId) {
      console.log('User not logged in');
    } else {
      return this.http.delete(environment.apiUrl + '/api/profiles/' + profileId + '/education', this.options)
        .flatMap((response) => {
          return this.http
            .post(environment.apiUrl + '/api/profiles/' + profileId + '/education', this.sanitize(education), this.options);
        })
        .map((result2) => result2
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
    return this.http.get(environment.apiUrl + '/api/peers?filter=' + JSON.stringify(query));
  }

  /**
   * getTopics
   */
  public getLearningTopics(userId, query?: any) {
    if (query) {
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning?filter=' + JSON.stringify(query))
        .map(response => response);
    } else {
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning')
        .map(response => response);
    }

  }

  public getTeachingTopics(userId, query: any) {
    return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching?filter=' + JSON.stringify(query))
      .map(response => response);
  }

  public getTeachingExternalTopics(userId: string, query: any) {
    return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching?filter=' + JSON.stringify(query))
      .map(response => response);
  }
  /**
   * unfollowTopic
   */
  public unfollowTopic(userId, type, topicId: string) {
    if (type === 'learning') {
      return this.http.delete(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel/' + topicId);
    } else {
      return this.http.delete(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId);
    }
  }

  public stopTeachingTopic(userId, topicId: string) {
    return this.http.delete(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId);
  }
  /**
   * followTopic
   */
  public followTopic(userId, type, topicId: string, body?: any) {
    if (type === 'learning') {
      if (body) {
        return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel/' + topicId, body, this.options)
          .map(response => response);
      } else {
        return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel/' + topicId, {}, this.options)
          .map(response => response);
      }
    } else {
      if (body) {
        return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, body, this.options)
          .map(response => response);
      } else {
        return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, {}, this.options)
          .map(response => response);
      }
    }
  }

  public updateTeachingTopic(userId, topicId: string, body?: any) {
    if (body) {
      console.log(topicId + ' ' + body.experience);
      return this.http.delete(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, this.options)
        .flatMap((response) => {
          return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, body, this.options);
        }).map(response => response);
    } else {
      return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel/' + topicId, {}, this.options)
        .map(response => response);
    }
  }


  public followMultipleTopicsLearning(userId, body: any) {
    return this.http.patch(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel', body, this.options)
      .map(response => response);
  }

  public followMultipleTopicsTeaching(userId, body: any) {
    return this.http.patch(environment.apiUrl + '/api/peers/' + userId + '/topicsTeaching/rel', body, this.options)
      .map(response => response);
  }

  /**
   * reportProfile
   */
  public reportProfile(userId: string, body: any) {
    return this.http.post(environment.apiUrl + '/api/peers/' + userId + '/flags', body)
      .map(response => response);
  }

  /**
   * approvePeer
   */
  public approvePeer(peer: any) {
    return this.http.post(environment.apiUrl + '/api/peers/' + peer.id + '/approve', {})
      .map(response => response);
  }

  public getProfileProgressObject(profile: any): any {
    console.log(profile);
    const pProg = {};
    let progress = 0;
    let totalKeys = 0;
    for (const key in profile) {
      if (profile.hasOwnProperty(key)) {
        if (key === 'id' || key === 'joining_date' || key === 'is_teacher'
          || key === 'promoOptIn' || key === 'onboardingStage' || key === 'custom_url'
          || key === 'createdAt' || key === 'updatedAt' || key === 'other_languages' || key === 'location_string'
          || key === 'location_lat' || key === 'location_lng' || key === 'portfolio_url'
          || key === 'vat_number' || key === 'emergency_contact' || key === 'peer') {
        } else {
          totalKeys++;
          if (profile[key] && profile[key].length > 0) {
            progress++;
          }
        }
      }
    }

    for (const key in profile.peer[0]) {
      if (profile.peer[0].hasOwnProperty(key)) {
        if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'isAdmin' || key === 'ownedCollections') {
        } else {
          totalKeys++;
          if (profile.peer[0].key && profile.peer[0].key.length > 0) {
            progress++;
          }
        }
      }
    }


    // if (profile.first_name) { prog++; }
    // if (profile.last_name) { prog++; }
    // if (profile.headline) { prog++; }
    // if (profile.gender) { prog++; }
    // if (profile.dobDay) { prog++; }
    // if (profile.dobMonth) { prog++; }
    // if (profile.dobYear) { prog++; }
    // if (profile.currency) { prog++; }
    // if (profile.vat_number) { prog++; }
    // if (profile.phones && profile.phones.length > 0) { prog++; }
    // if (profile.location_string) { prog++; }
    // if (profile.preferred_language) { prog++; }
    // if (profile.emergency_contacts && profile.emergency_contacts.length > 0) { prog++; }

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
      .get(environment.apiUrl + '/api/peers/' + userId + '/bookmarks' + '?filter=' + filter, this.options)
      .map((response) => {
        cb(null, response);
      }, (err) => {
        cb(err);
      }).subscribe();
  }

  public imgErrorHandler(event) {
    event.target.src = '/assets/images/user-placeholder.jpg';
  }

  public getJoinedCommunities(peerId: string, filter: any) {
    return this.http.get(environment.apiUrl + '/api/peers/' + peerId + '/communities?filter=' + JSON.stringify(filter));
  }
}
