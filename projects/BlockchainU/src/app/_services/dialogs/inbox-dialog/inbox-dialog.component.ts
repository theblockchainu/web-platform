import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { environment } from '../../../../environments/environment';
import { InboxService } from '../../inbox/inbox.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { SocketService } from '../../socket/socket.service';
import { NotificationService } from '../../notification/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { MatDialogRef } from '@angular/material';
import { UcWordsPipe } from 'ngx-pipes';

@Component({
	selector: 'app-inbox-dialog',
	templateUrl: './inbox-dialog.component.html',
	styleUrls: ['./inbox-dialog.component.scss']
})
export class InboxDialogComponent implements OnInit {

	public loadingMessages = false;
	public joinedRooms = [];
	public tempJoinedRooms = [];
	public selectedRoom;
	public userId;
	private key = 'userId';
	public selected = '';
	public message = '';
	public envVariable;

	public picture_url = false;
	public notifications = [];
	public notificationsLoaded = false;

	constructor(
		public activatedRoute: ActivatedRoute,
		public _inboxService: InboxService,
		public _socketService: SocketService,
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private router: Router,
		public dialogRef: MatDialogRef<InboxDialogComponent>,
		private _notificationService: NotificationService,
		private ucwords: UcWordsPipe
	) {
		this.envVariable = environment;
		this.userId = this._cookieUtilsService.getValue(this.key);
	}

	ngOnInit() {
		this.getMessages();
		this.getNotifications();
	}

	private getMessages() {
		this.loadingMessages = true;
		this._inboxService.getRoomData(5)
			.subscribe((response: any) => {
				if (response) {
					this.initializeInbox(response);
				} else {
					console.log('No joined rooms!');
					this.loadingMessages = false;
				}
			});
	}
	public initializeInbox(response) {
		this.sortFilterJoinedRooms(response);
		this.tempJoinedRooms = this.joinedRooms;
		this._socketService.listenForNewMessage().subscribe(newMessage => {
			const receivedInRoomIndex = this.joinedRooms.findIndex(room => (room.id === newMessage['roomId']));
			// If this room exists for the user and the message hasnt already been added to array
			if (receivedInRoomIndex !== -1 && !this.joinedRooms[receivedInRoomIndex].messages.find(message => (message.id === newMessage['id']))) {
				this.joinedRooms[receivedInRoomIndex].messages.push(newMessage);
				this.sortFilterJoinedRooms(this.joinedRooms);
			}
		});
		this.loadingMessages = false;
	}

	public sortFilterJoinedRooms(response) {
		// this.joinedRooms = response.filter(room => (room.collection && room.collection.length > 0));
		this.joinedRooms = response;
		this.joinedRooms.sort((a, b) => {
			if (b.messages && a.messages) {
				return moment(b.messages[b.messages.length - 1].updatedAt).diff(moment(a.messages[a.messages.length - 1].updatedAt), 'seconds');
			} else {
				return 0;
			}
		});
		this.joinedRooms.forEach(joinedRoom => {
			return this._inboxService.formatDateTime(joinedRoom, this.userId);
		});
		this.tempJoinedRooms = this.joinedRooms;
	}

	public openInbox(room) {
		this.router.navigate(['console', 'inbox', room.id]);
		this.dialogRef.close();

	}

	public imgErrorHandler(event) {
		event.target.src = '/assets/images/placeholder-image.jpg';
	}

	public goToInbox() {
		this.router.navigate(['console', 'inbox']);
		this.dialogRef.close();
	}

	public goToNotifications() {
		this.router.navigate(['console', 'account', 'notifications']);
		this.dialogRef.close();
	}


	private getNotifications() {
		this.notificationsLoaded = false;
		this._notificationService.getNotifications(this.userId,
			'{"include": [{"actor":"profiles"}, "collection", {"content": ["packages", "availabilities", "payments"]}], "order": "createdAt DESC", "limit": "10" }',
			(err, result) => {
				if (err) {
					console.log(err);
				} else {
					result.forEach(resultItem => {
						if (resultItem.actor[0] !== undefined) {
							this.notifications.push(resultItem);
						}
					});
					this.notificationsLoaded = true;
				}
			});
	}

	public getNotificationText(notification) {
		const replacements = {
			'%username%': '<b>' + this.ucwords.transform(notification.actor[0].profiles[0].first_name) + ' '
				+ this.ucwords.transform(notification.actor[0].profiles[0].last_name) + '</b>',
			'%collectionTitle%': (notification.collection && notification.collection.length > 0) ?
				this.ucwords.transform(notification.collection[0].title) : '***',
			'%collectionName%': (notification.collection && notification.collection.length > 0) ?
				'<b>' + this.ucwords.transform(notification.collection[0].title) + '</b>' : '***',
			'%collectionType%': (notification.collection && notification.collection.length > 0) ?
				this.ucwords.transform(notification.collection[0].type) : '***',
			'%sessionDate%': (notification.content && notification.content.length > 0) ?
				'<b>' + moment(notification.content[0].availabilities[0].startDateTime).format('Do MMM') + '</b>' : '***',
			'%sessionHours%': (notification.content && notification.content.length > 0) ?
				'<b>' + parseInt(notification.content[0].packages[0].duration, 10) / 60 + ' hours</b>' : '***'
		},
			str = notification.description;

		return str.replace(/%\w+%/g, function (all) {
			return replacements[all] || all;
		});
	}

	public getNotificationTime(notification) {
		const createdAt = moment(notification.createdAt);
		return createdAt.fromNow();
	}

	public hideNotification(notification) {
		notification.hidden = true;
		this._notificationService.updateNotification(this.userId, notification, (err, patchResult) => {
			if (err) {
				console.log(err);
				notification.hidden = false;
			}
		});
	}

	public openViewAll() {
		this.router.navigate(['console', 'account', 'notifications']);
		this.dialogRef.close();
	}

	public onNotificationClick(notification) {
		this.dialogRef.close();
		this.router.navigate(notification.actionUrl);
	}
}
