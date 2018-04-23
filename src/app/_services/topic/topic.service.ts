import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { Observable } from 'rxjs/Observable';
import {environment} from '../../../environments/environment';

@Injectable()
export class TopicService {
	public userId;
	public options;
	public envVariable;
	constructor(
		private http: HttpClient,
		public router: Router,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
		this.options = requestHeaderService.getOptions();
	}
	
	public getTopics(query?: any): Observable<any> {
		return this.http.get(environment.apiUrl + '/api/topics?filter=' + JSON.stringify(query), this.options)
			.map(res => res || []);
	}
	
	public requestNewTopic(topic: string): Observable<any> {
		const body = {
			name: topic,
			type: 'user'
		};
		return this.http.post(environment.apiUrl + '/api/requestedtopics/request-topic', body, this.options)
			.map(res => res);
	}
	
	public deleteRelTopic(userId, topic): Observable<any> {
		return this.http.delete(environment.apiUrl + '/api/collections/' + userId + '/topics/rel/' + topic, this.options)
			.map(res => res);
	}
	
	public relTopic(userId, topicId): Observable<any> {
		return this.http.put(environment.apiUrl + '/api/peers/' + userId + '/topicsLearning/rel/' + topicId, {}, this.options)
			.map(res => res);
	}
	
	public relTopicCollection(collectionId, topicId): Observable<any> {
		return this.http.put(environment.apiUrl + '/api/collections/' + collectionId + '/topics/rel/' + topicId, {}, this.options)
			.map(res => res);
	}
	
	public getDefaultTopics() {
		return this.http.get(environment.searchUrl + '/api/search/topics', this.options)
			.map(res => res || []);
		
	}
	
	public getDefaultTopicsAtOnboarding(url) {
		return this.http.get(url, this.options)
			.map(res => res || []);
		
	}
	
	public addNewTopic(topicName: string) {
		const body = {
			'name': topicName,
			'type': 'user'
		};
		return this.http.post(environment.apiUrl + '/api/topics', body, this.options)
			.map((response) => response, (err) => {
				console.log('Error: ' + err);
			});
	}
	
	public suggestionPerQuery(query: string): Observable<any> {
		return this.http.get(environment.searchUrl + '/api/search/topics/suggest?field=name&query=' + query, this.options)
			.map(res => res || []);
	}
	
}
