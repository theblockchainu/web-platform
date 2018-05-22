import { Injectable } from '@angular/core';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CommentService {
	public envVariable;

	constructor(private http: HttpClient,
		private requestHeaderService: RequestHeaderService) {
		this.envVariable = environment;
	}
	/**
	 * replyToComment
	 */
	public replyToComment(commentId, replyBody) {
		return this.http
			.post(environment.apiUrl + '/api/comments/' + commentId + '/replies', replyBody, this.requestHeaderService.options);
	}

	/**
	 * Add comment upvote
	 * @param commentId
	 * @param upvoteBody
	 * @returns {Observable<any>}
	 */
	public addCommentUpvote(commentId, upvoteBody) {
		return this.http
			.post(environment.apiUrl + '/api/comments/' + commentId + '/upvotes', upvoteBody, this.requestHeaderService.options);
	}

	/**
	 * Add reply upvote
	 * @param replyId
	 * @param upvoteBody
	 * @returns {Observable<any>}
	 */
	public addReplyUpvote(replyId, upvoteBody) {
		return this.http
			.post(environment.apiUrl + '/api/replies/' + replyId + '/upvotes', upvoteBody, this.requestHeaderService.options);
	}

	/**
	 * deleteReply
	 */
	public deleteReply(replyId: string) {
		return this.http
			.delete(environment.apiUrl + '/api/replies/' + replyId, this.requestHeaderService.options);
	}

	/**
	 * updateReply
	 */
	public updateReply(replyId: string, replyBody: any) {
		return this.http
			.patch(environment.apiUrl + '/api/replies/' + replyId, replyBody, this.requestHeaderService.options);
	}
	/**
	 * deleteComment
	 */
	public deleteComment(commentId: string) {
		return this.http
			.delete(environment.apiUrl + '/api/comments/' + commentId, this.requestHeaderService.options);
	}

}
