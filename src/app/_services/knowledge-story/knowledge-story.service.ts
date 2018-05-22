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

  /**
   * getknowledgeStoryRequests
   */
  public getknowledgeStoryRequests(userId: string, filter: any) {
    return this._HttpClient.get(environment.apiUrl + '/api/peers/' + userId + '/knowledgeStories?filter=' + JSON.stringify(filter), this._RequestHeaderService.options);
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

}

interface PatchManyObject {
  targetIds: Array<string>;
}

interface StoryRequest {
  status: 'approved' | 'rejected' | 'pending';
  visibility: 'private' | 'public';
}
