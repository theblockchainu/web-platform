import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
@Injectable()
export class TopicService {
	public userId;
	public envVariable;
	constructor(
		private http: HttpClient,
		public router: Router,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
	}

	public getTopics(query?: any): Observable<any> {
		// if (query) {
		// 	query.where = { 'origin': 'theblockchainu' };
		// 	console.log(query);
		// }
		return this.http.get(environment.apiUrl + '/api/topics?filter=' + JSON.stringify(query), this.requestHeaderService.options)
			.pipe(map(res => {
				console.log(res);
				return res || [];
			}));
	}

	public requestNewTopic(topic: string): Observable<any> {
		const body = {
			name: topic,
			type: 'user'
		};
		return this.http.post(environment.apiUrl + '/api/requestedtopics/request-topic', body, this.requestHeaderService.options)
			;
	}

	public deleteRelTopic(userId, topic): Observable<any> {
		return this.http.delete(environment.apiUrl + '/api/collections/' + userId + '/topics/rel/' + topic, this.requestHeaderService.options)
			;
	}

	public relTopic(userId, topicId): Observable<any> {
		return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel/' + topicId, {}, this.requestHeaderService.options)
			;
	}

	public relTopicCollection(collectionId, topicId): Observable<any> {
		return this.http.put(environment.apiUrl + '/api/collections/' + collectionId + '/topics/rel/' + topicId, {}, this.requestHeaderService.options)
			;
	}

	public getDefaultTopics() {
		return this.http.get(environment.searchUrl + '/api/search/topics', this.requestHeaderService.options)
			.pipe(map(res => res || []));

	}

	public getDefaultTopicsAtOnboarding(url) {
		return this.http.get(url, this.requestHeaderService.options)
			.pipe(map(res => res || []));

	}

	public addNewTopic(topicName: string) {
		const body = {
			'name': topicName,
			'type': 'user',
			'origin': 'theblockchainu'
		};
		return this.http.post(environment.apiUrl + '/api/topics', body, this.requestHeaderService.options);
	}

	public suggestionPerQuery(query: string): Observable<any> {
		return this.http.get(environment.searchUrl + '/api/search/topics/suggest?field=name&query=' + query, this.requestHeaderService.options)
			.pipe(map(res => res || []));
	}

}
