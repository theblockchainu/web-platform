import { Injectable } from '@angular/core';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class QuestionService {

    public envVariable;

    constructor(private http: HttpClient,
        private requestHeaderService: RequestHeaderService) {
        this.envVariable = environment;
    }


    /**
     * Add an answer to given question
     * @param questionId
     * @param answerBody
     */
    public answerToQuestion(questionId, answerBody) {
        return this.http
            .post(environment.apiUrl + '/api/questions/' + questionId + '/answers', answerBody, this.requestHeaderService.options);
    }

    /**
     * Add the current user as follower of this question
     * @param questionId
     * @param peerId
     */
    public addFollower(questionId, peerId) {
        return this.http
            .put(environment.apiUrl + '/api/questions/' + questionId + '/followers/rel/' + peerId, {}, this.requestHeaderService.options);
    }

    /**
     * Post a comment to an answer
     * @param answerId
     * @param commentBody
     */
    public postCommentToAnswer(answerId, commentBody) {
        return this.http
            .post(environment.apiUrl + '/api/answers/' + answerId + '/comments', commentBody, this.requestHeaderService.options);
    }

    /**
     * Post a comment to a question
     * @param questionId
     * @param commentBody
     */
    public postCommentToQuestion(questionId, commentBody) {
        return this.http
            .post(environment.apiUrl + '/api/questions/' + questionId + '/comments', commentBody, this.requestHeaderService.options);
    }

    /**
     * Add an upvote to the given question
     * @param questionId
     * @param upvoteBody
     */
    public addQuestionUpvote(questionId, upvoteBody) {
        return this.http
            .post(environment.apiUrl + '/api/questions/' + questionId + '/upvotes', upvoteBody, this.requestHeaderService.options);
    }

    /**
     * Add an upvote to given answer
     * @param answerId
     * @param upvoteBody
     */
    public addAnswerUpvote(answerId, upvoteBody) {
        return this.http
            .post(environment.apiUrl + '/api/answers/' + answerId + '/upvotes', upvoteBody, this.requestHeaderService.options);
    }

    /**
     * Delete a question from DB
     * @param {string} questionId
     */
    public deleteQuestion(questionId: string) {
        return this.http
            .delete(environment.apiUrl + '/api/questions/' + questionId, this.requestHeaderService.options);
    }

    /**
     * Delete an answer from DB
     * @param {string} answerId
     */
    public deleteAnswer(answerId: string) {
        return this.http
            .delete(environment.apiUrl + '/api/answers/' + answerId, this.requestHeaderService.options);
    }

}
