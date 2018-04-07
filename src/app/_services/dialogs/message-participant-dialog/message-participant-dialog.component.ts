import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CookieUtilsService} from '../../cookieUtils/cookie-utils.service';
import {InboxService} from '../../inbox/inbox.service';
import {Router} from '@angular/router';
@Component({
	selector: 'app-message-participant-dialog',
	templateUrl: './message-participant-dialog.component.html',
	styleUrls: ['./message-participant-dialog.component.scss']
})
export class MessageParticipantDialogComponent implements OnInit {
	public messageForm: FormGroup;
	public userId;
	public existingChatRoom;
	public infoMessage = '';
	public sendingMessage = false;
	
	constructor(private _fb: FormBuilder,
				@Inject(MAT_DIALOG_DATA) public receivingUser: any,
				public _cookieUtilsService: CookieUtilsService,
				public _inboxService: InboxService,
				public router: Router,
				public dialogRef: MatDialogRef<MessageParticipantDialogComponent>,
	) { }
	
	ngOnInit() {
		this.messageForm = this._fb.group({
			message: ['', Validators.required],
			sent: ''
		});
		
		this.userId = this._cookieUtilsService.getValue('userId');
		
		if (this.userId) {
			this.fetchPeerRoom(this.userId, this.receivingUser.id);
		}
	}
	
	public fetchPeerRoom(fromUserId, toUserId) {
		const query = {
			include: [
				'participants'
			],
			where: {'type': 'peer'}
		};
		
		this._inboxService.getRooms(fromUserId, query).subscribe(result => {
			if (result) {
				result.forEach(joinedRoom => {
					if (joinedRoom.participants && joinedRoom.participants.length > 0 && joinedRoom.participants.find(participant => (participant.id === toUserId))) {
						this.existingChatRoom = joinedRoom;
					}
				});
			}
		});
	}
	
	/**
	 * sendMessage
	 */
	public sendMessage() {
		this.sendingMessage = true;
		const message = {
			text: this.messageForm.value.message
		};
		if (this.existingChatRoom) {
			this._inboxService.postMessage(this.existingChatRoom.id, message).subscribe(savedMessage => {
				if (savedMessage) {
					this.infoMessage = 'Message sent';
					this.messageForm.reset();
					this.sendingMessage = false;
				} else {
					this.infoMessage = 'Could not send message.';
					this.sendingMessage = false;
				}
			});
		} else {
			const room = {
				name: this.userId + '-' + this.receivingUser.id,
				type: 'peer'
			};
			this._inboxService.createRoom(this.userId, room).subscribe(createdRoom => {
				if (createdRoom) {
					this._inboxService.addParticipantToRoom(createdRoom.id, this.receivingUser.id).subscribe(result => {
						if (result) {
							this._inboxService.postMessage(createdRoom.id, message).subscribe(savedMessage => {
								if (savedMessage) {
									this.infoMessage = 'Message sent';
									this.existingChatRoom = createdRoom;
									this.messageForm.reset();
									this.sendingMessage = false;
								} else {
									this.infoMessage = 'Could not send message.';
									this.sendingMessage = false;
								}
							});
						} else {
							this.infoMessage = 'Could not send message.';
							this.sendingMessage = false;
						}
					});
				} else {
					this.infoMessage = 'Could not send message.';
					this.sendingMessage = false;
				}
			});
		}
	}
	
	public openChatRoom() {
		if (this.existingChatRoom) {
			this.dialogRef.close();
			this.router.navigate(['console', 'inbox', this.existingChatRoom.id]);
		}
	}
}
