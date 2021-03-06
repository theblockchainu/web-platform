import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import { RequestHeaderService } from '../requestHeader/request-header.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { environment } from '../../../environments/environment';
@Injectable()
export class ProjectSubmissionService {
	public key = 'userId';
	public envVariable;

	constructor(private http: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		private authService: AuthenticationService,
		public _requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
	}

	public submitProject(contentId: any, body: any) {
		if (contentId) {
			return this.http.post(environment.apiUrl + '/api/contents/' + contentId + '/submissions', body, this._requestHeaderService.options);
		}
	}

	public editProject(contentId: any, body: any) {
		if (contentId) {
			return this.http.put(environment.apiUrl + '/api/contents/' + contentId + '/submissions', body, this._requestHeaderService.options);
		}
	}

	public updateSubmission(submissionId: string, body: any) {
		return this.http.patch(environment.apiUrl + '/api/submissions/' + submissionId, body, this._requestHeaderService.options);
	}

	public saveSubmissionTags(submissionId, body: any) {
		if (submissionId) {
			return this.http.patch(environment.apiUrl + '/api/submissions/' + submissionId + '/topics', body, this._requestHeaderService.options);
		}
	}

	public viewSubmission(submissionId, query: any) {
		if (submissionId) {
			return this.http.get(environment.apiUrl + '/api/submissions/' + submissionId + '?filter=' + query, this._requestHeaderService.options);
		}
	}

	public addPeerSubmissionRelation(userId, submissionId) {
		if (userId && submissionId) {
			return this.http.put(environment.apiUrl + '/api/submissions/' + submissionId + '/peer/rel/' + userId, null, this._requestHeaderService.options);
		}
	}

	/**
	 * Add submission upvote
	 * @param replyId
	 * @param upvoteBody
	 * @returns {Observable<Response>}
	 */
	public addSubmissionUpvote(submissionId, upvoteBody) {
		return this.http
			.post(environment.apiUrl + '/api/submissions/' + submissionId + '/upvotes', upvoteBody, this._requestHeaderService.options);
	}
}
