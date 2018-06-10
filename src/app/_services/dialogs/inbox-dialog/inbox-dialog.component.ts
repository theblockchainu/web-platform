import {Component, OnInit} from '@angular/core';
import {ProfileService} from '../../profile/profile.service';
import {environment} from '../../../../environments/environment';
import {InboxService} from '../../inbox/inbox.service';
import {CookieUtilsService} from '../../cookieUtils/cookie-utils.service';
import {SocketService} from '../../socket/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';
import {MatDialogRef} from "@angular/material";

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
	
	constructor(
		public activatedRoute: ActivatedRoute,
		public _inboxService: InboxService,
		public _socketService: SocketService,
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private router: Router,
		public dialogRef: MatDialogRef<InboxDialogComponent>
	) {
		this.envVariable = environment;
		this.userId = this._cookieUtilsService.getValue(this.key);
	}
	
	ngOnInit() {
		this.loadingMessages = true;
		this._inboxService.getRoomData(5)
			.subscribe((response) => {
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
			return moment(b.messages[b.messages.length - 1].updatedAt).diff(moment(a.messages[a.messages.length - 1].updatedAt), 'seconds');
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

}
