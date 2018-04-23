import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { environment } from '../../../environments/environment';
@Injectable()
export class ProjectSubmissionService {
	public key = 'userId';
	private options;
	public envVariable;
	
	constructor(private http: HttpClient,
				private route: ActivatedRoute,
				public router: Router,
				private authService: AuthenticationService,
				public _requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
		this.options = this._requestHeaderService.getOptions();
	}
	
	public submitProject(contentId: any, body: any) {
		if (contentId) {
			return this.http.post(environment.apiUrl + '/api/contents/' + contentId + '/submissions', body, this.options);
		}
	}
	
	public editProject(contentId: any, body: any) {
		if (contentId) {
			return this.http.put(environment.apiUrl + '/api/contents/' + contentId + '/submissions', body, this.options);
		}
	}
	
	public updateSubmission(submissionId: string, body: any) {
		return this.http.patch(environment.apiUrl + '/api/submissions/' + submissionId, body, this.options);
	}
	
	public saveSubmissionTags(submissionId, body: any) {
		if (submissionId) {
			return this.http.patch(environment.apiUrl + '/api/submissions/' + submissionId + '/topics', body, this.options);
		}
	}
	
	public viewSubmission(submissionId, query: any) {
		if (submissionId) {
			return this.http.get(environment.apiUrl + '/api/submissions/' + submissionId + '?filter=' + query, this.options);
		}
	}
	
	public addPeerSubmissionRelation(userId, submissionId) {
		if (userId && submissionId) {
			return this.http.put(environment.apiUrl + '/api/submissions/' + submissionId + '/peer/rel/' + userId, null, this.options);
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
			.post(environment.apiUrl + '/api/submissions/' + submissionId + '/upvotes', upvoteBody, this.options);
	}
}
