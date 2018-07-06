import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';

@Injectable()
export class CommunityService {

    public key = 'userId';
    public envVariable;
    public now: Date;
    public activeTab = new BehaviorSubject('question');

    constructor(private http: HttpClient,
        private route: ActivatedRoute,
        public router: Router,
        private authService: AuthenticationService,
        private requestHeaderService: RequestHeaderService,
        private _cookieUtilsService: CookieUtilsService) {
        this.now = new Date();
        this.envVariable = environment;
    }

    public getCommunityDetail(id: string, param: any) {
        const filter = JSON.stringify(param);
        return this.http
            .get(environment.apiUrl + '/api/communities/' + id + '?filter=' + filter, this.requestHeaderService.options)
            .map((response: any) => response, (err) => {
                console.log('Error: ' + err);
            });

    }

    /**
     * getParticipants
     */
    public getParticipants(communityId, query) {
        const filter = JSON.stringify(query);
        return this.http
            .get(environment.apiUrl + '/api/communities/' + communityId + '/participants?filter=' + filter, this.requestHeaderService.options);
    }

    /**
     * addParticipant
     collectionID:string,userId:string,calendarId:string
     */
    public addParticipant(communityId: string, userId: string, cb) {
        const body = {};
        this.http
            .put(environment.apiUrl + '/api/communities/' + communityId + '/participants/rel/' + userId, body, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }

    /**
     * removeParticipant
     */
    public removeParticipant(communityId: string, participantId: string) {
        return this.http.delete(environment.apiUrl + '/api/communities/' + communityId + '/participants/rel/' + participantId, this.requestHeaderService.options);
    }

    /**
     * getComments
     */
    public getComments(communityId: string, query: any, cb) {
        const filter = JSON.stringify(query);
        this.http
            .get(environment.apiUrl + '/api/communities/' + communityId + '/comments' + '?filter=' + filter, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }

    /**
     * postComments
     worrkshopID   */
    public postComments(communityId: string, commentBody: any, cb) {
        this.http
            .post(environment.apiUrl + '/api/communities/' + communityId + '/comments', commentBody, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }

    /**
     * Get questions within a community
     * @param {string} communityId
     * @param query
     * @param cb
     */
    public getQuestions(communityId: string, query: any, cb) {
        const filter = JSON.stringify(query);
        this.http
            .get(environment.apiUrl + '/api/communities/' + communityId + '/questions' + '?filter=' + filter, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }

    /**
     * Get links within a community
     * @param {string} communityId
     * @param query
     * @param cb
     */
    public getLinks(communityId: string, query: any, cb) {
        const filter = JSON.stringify(query);
        this.http
            .get(environment.apiUrl + '/api/communities/' + communityId + '/links' + '?filter=' + filter, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }

    /**
     * Get questions within a community
     * @param {string} communityId
     * @param query
     * @param cb
     */
    public getCollections(communityId: string, query: any, cb) {
        const filter = JSON.stringify(query);
        this.http
            .get(environment.apiUrl + '/api/communities/' + communityId + '/collections' + '?filter=' + filter, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }


    /**
     * Add a new quesiton to this community
     * @param {string} communityId
     * @param questionBody
     * @returns {Observable<any>}
     */
    public postQuestion(communityId: string, questionBody: any) {
        return this.http
            .post(environment.apiUrl + '/api/communities/' + communityId + '/questions', questionBody, this.requestHeaderService.options);
    }


    /**
     * Delete a question from database
     * @param {string} questionId
     * @returns {Observable<any>}
     */
    public deleteQuestion(questionId: string) {
        return this.http
            .delete(environment.apiUrl + '/api/questions/' + questionId, this.requestHeaderService.options);
    }


    public imgErrorHandler(event) {
        event.target.src = '/assets/images/placeholder-image.jpg';
    }

    public userImgErrorHandler(event) {
        event.target.src = '/assets/images/user-placeholder.jpg';
    }

    /**
     *  View community
     */
    public viewCommunity(community) {
        this.router.navigate(['community', community.id]);
    }

    /**
     * open edit community
     */
    public openEditCommunity(community) {
        this.router.navigate(['community', community.id, 'edit', community.stage.length > 0 ? community.stage : 1]);
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

    public saveBookmark(communityId, cb) {
        const body = {};
        this.http
            .post(environment.apiUrl + '/api/communities/' + communityId + '/bookmarks', body, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }

    public removeBookmark(bookmarkId, cb) {
        const body = {};
        this.http
            .delete(environment.apiUrl + '/api/bookmarks/' + bookmarkId, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }

    /**
     * getBookmarks
     */
    public getBookmarks(communityId: string, query: any, cb) {
        const filter = JSON.stringify(query);
        this.http
            .get(environment.apiUrl + '/api/communities/' + communityId + '/bookmarks' + '?filter=' + filter, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }


    /**
     * Delete the entire community
     * @param {string} communityId
     * @returns {Observable<any>}
     */
    public deleteCommunity(communityId: string) {
        return this.http.delete(environment.apiUrl + '/api/communities/' + communityId, this.requestHeaderService.options);
    }

    public getActiveTab() {
        return this.activeTab.asObservable();
    }

    public setActiveTab(value) {
        this.activeTab.next(value);
    }

    /**
     * Add a new link to this community
     * @param communityId
     * @param linkBody
     * @param cb
     */
    public addLinkToCommunity(communityId, linkBody, cb) {
        this.http
            .post(environment.apiUrl + '/api/communities/' + communityId + '/links', linkBody, this.requestHeaderService.options)
            .map((response) => {
                cb(null, response);
            }, (err) => {
                cb(err);
            }).subscribe();
    }

    /**
     * requestCommunity
     */
    public requestCommunity(data: any) {
        return this.http.post(environment.apiUrl + '/api/peers/' + this._cookieUtilsService.getValue('userId')
            + '/community_requests', data, this.requestHeaderService.options);
    }

    /**
     * getRequestedComminities
     */
    public getRequestedComminities(filter: string) {
        return this.http.get(environment.apiUrl + '/api/community_requests?filter=' + filter, this.requestHeaderService.options);
    }

    /**
     * deleteRequest
     id:string*/
    public deleteRequest(id: string) {
        return this.http.delete(environment.apiUrl + '/api/community_requests/' + id, this.requestHeaderService.options);

    }

    /**
     * createCommunity
     */
    public createCommunity(data: any) {
        return this.http.post(environment.apiUrl + '/api/communities', data, this.requestHeaderService.options);
    }

    public linkTopics(communityID, body) {
        return this.http.patch(environment.apiUrl + '/api/communities/' + communityID + '/topics/rel', body, this.requestHeaderService.options);
    }

    public totalCommunititesCount() {
        return this.http.get(environment.apiUrl + '/api/communities/count', this.requestHeaderService.options);
    }
}
