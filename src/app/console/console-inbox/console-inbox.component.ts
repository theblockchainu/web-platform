import { AfterViewChecked, Component, DoCheck, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleComponent } from '../console.component';
import { InboxService } from '../../_services/inbox/inbox.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { SocketService } from '../../_services/socket/socket.service';
import { environment } from '../../../environments/environment';
import { ProfileService } from '../../_services/profile/profile.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { MatDialog } from '@angular/material';
import { DialogsService } from '../../_services/dialogs/dialog.service';

@Component({
	selector: 'app-console-inbox',
	templateUrl: './console-inbox.component.html',
	styleUrls: ['./console-inbox.component.scss']
})
export class ConsoleInboxComponent implements OnInit, AfterViewChecked {
	public loadingMessages = false;
	public joinedRooms = [];
	public tempJoinedRooms = [];
	public experienceCollection = [];
	public classCollection = [];
	public selectedRoom;
	public userId;
	private key = 'userId';
	public selected = '';
	public message = '';
	public envVariable;
	public loggedInPeer;
	public urlRoomId;
	@ViewChild('chatInputBox') chatInputBox;
	@ViewChild('messageContainer') private messageContainer: ElementRef;
	@ViewChild('scrollMe') private myScrollContainer: ElementRef;
	@ViewChild('messageNotification') messageNotification;

	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleComponent: ConsoleComponent,
		public _inboxService: InboxService,
		public _socketService: SocketService,
		public _profileService: ProfileService,
		public _collectionService: CollectionService,
		private _cookieUtilsService: CookieUtilsService,
		public router: Router,
		private dialog: MatDialog,
		private dialogsService: DialogsService
	) {
		this.envVariable = environment;
		activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleComponent.setActiveTab(urlSegment[0].path);
		});
		activatedRoute.params.subscribe(params => {
			this.urlRoomId = params['roomId'];
		});
		this.userId = this._cookieUtilsService.getValue(this.key);
	}

	ngOnInit() {
		this.loadingMessages = true;
		this._inboxService.getRoomData(50)
			.subscribe((response : any) => {
				if (response) {
					this.getPeerDataAndInitialize(response);
				} else {
					console.log('No joined rooms!');
					this.loadingMessages = false;
				}
			});
	}

	public initializeInbox(response) {
		this.sortFilterJoinedRooms(response);
		if (this.urlRoomId) {
			const urlRoomIndex = this.joinedRooms.findIndex(room => (room.id === this.urlRoomId));
			if (urlRoomIndex !== -1) {
				this.enterRoom(this.joinedRooms[urlRoomIndex]);
			} else {
				this.enterRoom(this.joinedRooms[0]);
			}
		} else {
			this.enterRoom(this.joinedRooms[0]);
		}
		this.tempJoinedRooms = this.joinedRooms;
		this.getCollections();
		this.selected = 'all';
		this._socketService.listenForNewMessage().subscribe(newMessage => {
			const receivedInRoomIndex = this.joinedRooms.findIndex(room => (room.id === newMessage['roomId']));
			// If this room exists for the user and the message hasnt already been added to array
			if (receivedInRoomIndex !== -1 && !this.joinedRooms[receivedInRoomIndex].messages.find(message => (message.localId === newMessage['localId']))) {
				if (this.joinedRooms[receivedInRoomIndex].id === this.selectedRoom.id) {
					// Messaged received in current room. Send read receipts
					this._inboxService.postMessageReadReceipt(newMessage['id'], {}).subscribe(readReceipt => {
						readReceipt['peer'] = [];
						readReceipt['peer'].push(this.loggedInPeer);
						if (newMessage['readReceipts']) {
							newMessage['readReceipts'].push(readReceipt);
						} else {
							newMessage['readReceipts'] = [];
							newMessage['readReceipts'].push(readReceipt);
						}
						// newMessage['read'] = true;
						this.joinedRooms[receivedInRoomIndex].messages.push(newMessage);
						this.messageNotification.nativeElement.play();
						/*this.joinedRooms[receivedInRoomIndex].unreadCount--;
						if (this.joinedRooms[receivedInRoomIndex].unreadCount <= 0) {
							this.joinedRooms[receivedInRoomIndex].unread = false;
						}*/
						this.sortFilterJoinedRooms(this.joinedRooms);
					});
				} else {
					this.joinedRooms[receivedInRoomIndex].messages.push(newMessage);
					this.messageNotification.nativeElement.play();
					this.sortFilterJoinedRooms(this.joinedRooms);
				}
			}
		});
		this.scrollToBottom();
		this.loadingMessages = false;
	}

	ngAfterViewChecked() {
		this.scrollToBottom();
	}

	public sortFilterJoinedRooms(response) {
		// this.joinedRooms = response.filter(room => (room.collection && room.collection.length > 0));
		this.joinedRooms = response;
		this.joinedRooms.sort((a, b) => {
			return moment(b.messages[b.messages.length - 1].updatedAt).diff(moment(a.messages[a.messages.length - 1].updatedAt), 'seconds');
		});
		console.log(this.joinedRooms);
		this.joinedRooms.forEach(joinedRoom => {
			return this._inboxService.formatDateTime(joinedRoom, this.userId);
		});
		this.tempJoinedRooms = this.joinedRooms;
	}

	public enterRoom(room) {
		if (room !== undefined) {
			this.selectedRoom = room;
			this.router.navigate(['console', 'inbox', room.id]);
			if (room && room.unread && room.messages) {
				room.messages.forEach(message => {
					if (!message.read && message.peer && message.peer.length > 0 && message.peer[0].id !== this.loggedInPeer.id) {
						this._inboxService.postMessageReadReceipt(message.id, {}).subscribe(readReceipt => {
							readReceipt['peer'] = [];
							readReceipt['peer'].push(this.loggedInPeer);
							if (message.readReceipts) {
								message['readReceipts'].push(readReceipt);
							} else {
								message.readReceipts = [];
								message['readReceipts'].push(readReceipt);
							}
							this.sortFilterJoinedRooms(this.joinedRooms);
						});
					}
				});
			}
		}
	}

	public getPeerDataAndInitialize(response) {
		this._profileService.getPeerData(this.userId, { include: 'profiles' }).subscribe((result: any) => {
			this.loggedInPeer = result;
			this.initializeInbox(response);
		});
	}

	public postMsg(event, roomId) {
		event.preventDefault();
		const body = {
			'text': this.message,
			'type': 'user',
			'localId': moment().unix()
		};
		this.message = '';
		const tempMessage = _.clone(body);
		tempMessage['peer'] = [];
		tempMessage['peer'].push(this.loggedInPeer);
		tempMessage['updatedAt'] = moment().format();
		tempMessage['delivered'] = false;
		console.log(tempMessage);
		this.selectedRoom.messages.push(tempMessage);
		this._inboxService.postMessage(roomId, body)
			.subscribe((response : any) => {
				response['peer'] = [];
				response['peer'].push(this.loggedInPeer);
				console.log(response);
				const foundMsgIndex = this.selectedRoom.messages.findIndex(message => (message.localId === response['localId']));
				if (foundMsgIndex !== -1) {
					console.log('found undelivered message. Updating it. ');
					this.selectedRoom.messages.splice(foundMsgIndex, 1);
					this.selectedRoom.messages.push(response);
					this.sortFilterJoinedRooms(this.joinedRooms);
				} else {
					this.selectedRoom.messages.push(response);
					this.sortFilterJoinedRooms(this.joinedRooms);
				}
				this.scrollToBottom();
			});
	}

	public imgErrorHandler(event) {
		event.target.src = '/assets/images/placeholder-image.jpg';
	}

	public getCollections() {
		this.joinedRooms.forEach(element => {
			this.experienceCollection = _.filter(element.collection, function (o) { return o.type === 'experience'; });
		});

		this.joinedRooms.forEach(element => {
			this.classCollection = _.filter(element.collection, function (o) { return o.type === 'class'; });
		});
	}

	public getSelectedCollection() {
		if (this.selected === 'class') {
			this.tempJoinedRooms = this.classCollection;
		} else if (this.selected === 'experience') {
			this.tempJoinedRooms = this.experienceCollection;
		} else {
			this.tempJoinedRooms = this.joinedRooms;
		}
	}

	public scrollToBottom() {
		try {
			this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
		} catch (err) { }
	}

	public viewAllParticipants() {
		this.dialogsService.viewParticipantstDialog(
			this.selectedRoom.participants,
			this.selectedRoom.collection[0].id,
			this.selectedRoom.belongsToUser ? 'teacher' : 'participant'
		);
	}
}

