import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
@Injectable()
export class SocialSharingService {
	
	constructor(
		private httpClient: HttpClient,
		private requestHeaderService: RequestHeaderService
	) { }
	
	public getConnectedPlatforms(userId: string) {
		return this.httpClient.get(environment.apiUrl + '/api/peers/' + userId + '/identities', this.requestHeaderService.options);
	}
	
	public getUserContacts(userId) {
		return this.httpClient.get(environment.apiUrl + '/api/peers/' + userId + '/contact', this.requestHeaderService.options);
	}
	
	public inviteContacts(userId: string, inviteList: Array<any>) {
		return this.httpClient.post(environment.apiUrl + '/api/peers/' + userId + '/invites', inviteList, this.requestHeaderService.options);
	}
	
	public deleteContact(contactId) {
		return this.httpClient.delete(environment.apiUrl + '/api/contacts/' + contactId, this.requestHeaderService.options);
	}
	
	getPeerInvite(peerInviteId: string, filter: any) {
		return this.httpClient.get(environment.apiUrl + '/api/peer_invites/' + peerInviteId + '?filter=' + JSON.stringify(filter), this.requestHeaderService.options);
	}
}
