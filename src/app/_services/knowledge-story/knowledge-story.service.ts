import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class KnowledgeStoryService {
	constructor(
		private _HttpClient: HttpClient,
		private _RequestHeaderService: RequestHeaderService
	) {
	}

	/**
	 * requestKnowledgeStory
	 */
	public createKnowledgeStoryRequest(userId: string, body: StoryRequest) {
		console.log(body);
		return this._HttpClient.post(environment.apiUrl + '/api/peers/' + userId + '/knowledgeStories', body, this._RequestHeaderService.options);
	}

	public patchKnowledgeStoryRequest(storyId: string, body: StoryRequest) {
		return this._HttpClient.patch(environment.apiUrl + '/api/knowledge_stories/' + storyId, body, this._RequestHeaderService.options);
	}

	/**
	 * patchTopics
	 */
	public connectTopics(knowledgeStoryId: string, body: PatchManyObject) {
		return this._HttpClient.patch(environment.apiUrl + '/api/knowledge_stories/' + knowledgeStoryId + '/topics/rel', body, this._RequestHeaderService.options);
	}

	/**
	 * patchPeers
	 */
	public connectPeers(knowledgeStoryId: string, body: PatchManyObject) {
		return this._HttpClient.patch(environment.apiUrl + '/api/knowledge_stories/' + knowledgeStoryId + '/peer/rel', body, this._RequestHeaderService.options);
	}

	public connectPeer(knowledgeStoryId: string, peerId: string) {
		return this._HttpClient.put(environment.apiUrl + '/api/knowledge_stories/' + knowledgeStoryId + '/peer/rel/' + peerId, {}, this._RequestHeaderService.options);
	}

	public requestPeers(knowledgeStoryId: string, peerId: string) {
		return this._HttpClient.put(environment.apiUrl + '/api/knowledge_stories/' + knowledgeStoryId + '/requests/rel/' + peerId, {}, this._RequestHeaderService.options);
	}

	public deleteRequest(knowledgeStoryId: string, peerId: string) {
		return this._HttpClient.delete(environment.apiUrl + '/api/knowledge_stories/' + knowledgeStoryId + '/requests/rel/' + peerId, this._RequestHeaderService.options);
	}

	/**
	 * getknowledgeStoryRequests
	 */
	public getknowledgeStoryRequests(userId: string, filter: any) {
		return this._HttpClient.get(environment.apiUrl + '/api/peers/' + userId + '/knowledgeStories?filter=' + JSON.stringify(filter), this._RequestHeaderService.options);
	}


	public fetchKnowledgeStory(storyId: string, filter: any) {
		return this._HttpClient.get(environment.apiUrl + '/api/knowledge_stories/' + storyId + '?filter=' + JSON.stringify(filter), this._RequestHeaderService.options);
	}
	
	public fetchBlockTransactions(userId: string, topics: any) {
		return this._HttpClient.get(environment.apiUrl + '/api/peers/' + userId + '/blockTransactions?topics=' + JSON.stringify(topics), this._RequestHeaderService.options)
			.map(res => res,
				err => err);
	}

	/**
	 * getavailableKnowledgeStories
	 */
	public getavailableKnowledgeStories(userId: string, filter: any) {
		return this._HttpClient.get(environment.apiUrl + '/api/peers/' + userId + '/availableStories?filter=' + JSON.stringify(filter), this._RequestHeaderService.options);
	}

	public patchKnowledgeStoryRequests(userId: string, body: any) {
		return this._HttpClient.patch(environment.apiUrl + '/api/knowledge_stories/' + userId, body, this._RequestHeaderService.options);
	}

	/**
	 * deleteStory
	 */
	public deleteStory(storyId: string) {
		return this._HttpClient.delete(environment.apiUrl + '/api/knowledge_stories/' + storyId, this._RequestHeaderService.options);
	}

	/**
	 * removePeerRelation
	 */
	public removePeerRelation(peerId: string, storyId: string) {
		return this._HttpClient.delete(environment.apiUrl + '/api/knowledge_stories/' + storyId + '/peer/rel/' + peerId, this._RequestHeaderService.options);
	}
}

interface PatchManyObject {
	targetIds: Array<string>;
}

interface StoryRequest {
	status?: 'approved' | 'rejected' | 'pending';
	visibility?: 'private' | 'public';
}
