import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
@Injectable()
export class InboxService {
	public key = 'userId';
	public envVariable;

	constructor(private http: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		public _requestHeaderService: RequestHeaderService,
		private _cookieUtilsService: CookieUtilsService
	) {
		this.envVariable = environment;
	}

	public getRoomData(limit) {
		const userId = this._cookieUtilsService.getValue(this.key);
		const query = {
			'include': [
				{
					relation: 'collection',
					scope: {
						include: {
							'owners': 'profiles'
						},
						where: { type: { 'neq': 'session' } }
					}
				},
				{
					relation: 'messages',
					scope: {
						include: [
							{
								'peer': 'profiles'
							},
							{ 'deliveryReceipts': 'peer' },
							{ 'readReceipts': 'peer' }
						],
						order: 'updatedAt ASC'
					}
				},
				{ 'participants': { 'profiles': 'work' } }
			],
			'limit': limit
		};
		if (userId) {
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/joinedRooms?filter=' + JSON.stringify(query), this._requestHeaderService.options)
				.map(
					(response: any) => response
				);
		} else {
			return null;
		}
	}

	public getRooms(userId, query) {
		return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/joinedRooms?filter=' + JSON.stringify(query), this._requestHeaderService.options)
			.map(
				(response: any) => response
			);
	}

	public createRoom(peerId, body) {
		return this.http.post(environment.apiUrl + '/api/peers/' + peerId + '/joinedRooms', body, this._requestHeaderService.options)
			.map((response: any) => response);
	}

	public addParticipantToRoom(roomId, participantId) {
		return this.http.put(environment.apiUrl + '/api/rooms/' + roomId + '/participants/rel/' + participantId, {}, this._requestHeaderService.options)
			.map((response: any) => response);
	}

	public postMessage(roomId, body) {
		return this.http.post(environment.apiUrl + '/api/rooms/' + roomId + '/messages', body, this._requestHeaderService.options)
			.map((response: any) => response);
	}

	public postMessageDeliveryReceipt(messageId, body) {
		return this.http.post(environment.apiUrl + '/api/messages/' + messageId + '/deliveryReceipts', body, this._requestHeaderService.options)
			.map((response: any) => response);
	}

	public postMessageReadReceipt(messageId, body) {
		return this.http.post(environment.apiUrl + '/api/messages/' + messageId + '/readReceipts', body, this._requestHeaderService.options)
			.map((response: any) => response);
	}

	public formatDateTime(room, loggedInUserId) {
		let participantTextHeader = '';
		const participantTextHeaderSub = '';
		room.unread = false;
		room.unreadCount = 0;
		room.belongsToUser = false;
		if (room.type === 'peer') {
			if (room.participants && room.participants.length > 0) {
				const participatingPeer = room.participants.find(participant => (participant.id !== loggedInUserId));
				if (participatingPeer) {
					room.name = participatingPeer.profiles[0].first_name + ' ' + participatingPeer.profiles[0].last_name;
					room.participatingPeerImage = participatingPeer.profiles[0].picture_url;
				} else {
					room.name = 'Dummy Room';
					room.participatingPeerImage = '';
				}
			} else {
				room.name = 'Dummy Room';
				room.participatingPeerImage = '';
			}
		}
		if (room.collection && room.collection.length > 0 && room.collection[0].owners && room.collection[0].owners[0].id === loggedInUserId) {
			room.belongsToUser = true;
		}
		if (room.participants) {
			if (room.participants.length > 2) {
				for (let i = 0; i < room.participants.length; i++) {
					if (i < 2) {
						participantTextHeader += room.participants[i].profiles[0].first_name + ' ' + room.participants[i].profiles[0].last_name + ', ';
					}
				}
				participantTextHeader = participantTextHeader.trim().slice(0, -1);
				participantTextHeaderSub.concat(' + ');
				participantTextHeaderSub.concat(room.participants.length - 2 + ' more');
			} else {
				for (let i = 0; i < room.participants.length; i++) {
					participantTextHeader += room.participants[i].profiles[0].first_name + ' ' + room.participants[i].profiles[0].last_name + ', ';
				}
				participantTextHeader = participantTextHeader.trim().slice(0, -1);
			}
			room.participantTextHeader = participantTextHeader;
			room.participantTextHeaderSub = participantTextHeaderSub;
		}
		if (room.messages) {
			room.messages.forEach(msg => {
				msg.read = false;
				msg.text = msg.text.trim();
				if (moment(msg.createdAt).format('MMM D YYYY') === moment().format('MMM D YYYY')) {
					msg.createdAtLocal = 'Today';
					msg.leftColLatestMsgTime = moment(msg.createdAt).format('LT');
				} else {
					msg.createdAtLocal = moment(msg.createdAt).format('ddd, MMM D YYYY');
					msg.leftColLatestMsgTime = moment(msg.createdAt).format('ddd');
				}
				if (msg.peer && msg.peer.length > 0 && msg.peer[0].id !== loggedInUserId && msg.readReceipts) {
					msg.readReceipts.forEach(readReceipt => {
						if (readReceipt.peer && readReceipt.peer.length > 0 && readReceipt.peer[0].id === loggedInUserId) {
							msg.read = true;
						}
					});
				} else if (msg.peer && msg.peer.length > 0 && msg.peer[0].id === loggedInUserId) {
					msg.read = true;
				} else if (msg.type === 'system') {
					msg.read = true;
				}
				if (!msg.read) {
					room.unread = true;
					room.unreadCount++;
				}
			});
		}
		return room;
	}

}
