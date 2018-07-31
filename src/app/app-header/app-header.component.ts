import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import { Observable } from 'rxjs/Observable';
import { ProfileService } from '../_services/profile/profile.service';
import { FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogsService } from '../_services/dialogs/dialog.service';
import { AppNotificationDialogComponent } from './dialogs/app-notification-dialog/app-notification-dialog.component';
import { NotificationService } from '../_services/notification/notification.service';
import { SearchService } from '../_services/search/search.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../_services/collection/collection.service';
import { InboxService } from '../_services/inbox/inbox.service';
import * as moment from 'moment';
import { InboxDialogComponent } from '../_services/dialogs/inbox-dialog/inbox-dialog.component';
import { SocketService } from '../_services/socket/socket.service';
import { UcWordsPipe } from 'ngx-pipes';
import { WalletService } from '../_services/wallet/wallet.service';

@Component({
	selector: 'app-header',
	templateUrl: './app-header.component.html',
	styleUrls: ['./app-header.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class AppHeaderComponent implements OnInit {
	isLoggedIn: Observable<boolean>;
	loggedIn: boolean;
	public hasNewNotification: boolean;
	public hasNewMessage: boolean;
	public profile: any;
	public userType: string;
	public myControl = new FormControl('');
	@ViewChild('messagesButton') messagesButton;
	@ViewChild('searchInputBar') searchInputBar;
	@ViewChild('messageNotification') messageNotification;
	public userId;
	public envVariable;
	public options: any[];
	public isEmailVerified: boolean;
	public isAccountApproved: boolean;
	public defaultProfileUrl: string;
	public isTeacher: boolean;
	public makeOldNotification: Array<any>;
	public joinedRooms: Array<any>;
	public tempJoinedRooms: Array<any>;
	public profileCompletionObject: any;
	public isSessionApproved: boolean;
	public sessionId: string;
	public isSearchBarVisible: boolean;
	public searching: boolean;

	constructor(public authService: AuthenticationService,
		private http: HttpClient,
		private _cookieService: CookieUtilsService,
		public _profileService: ProfileService,
		private router: Router,
		private dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private _notificationService: NotificationService,
		public _collectionService: CollectionService,
		public _searchService: SearchService,
		public _inboxService: InboxService,
		public _walletService: WalletService,
		public ucwords: UcWordsPipe,
		public _socketService: SocketService,
		public snackBar: MatSnackBar,
		private dialogsService: DialogsService) {
	}

	ngOnInit() {
		this.initializeHeader();
		this.isLoggedIn = this.authService.isLoginSubject.asObservable();
		this.authService.isLoginSubject.subscribe(res => {
			console.log('Initializing Header');
			console.log(res);
			this.initializeHeader();
		});
		this.myControl.valueChanges.subscribe((value) => {
			this.searching = true;
			this._searchService.getAllSearchResults(this.userId, value, (err, result) => {
				if (!err) {
					// this.options = result;
					// this.searching = false;
				} else {
					console.log(err);
					this.searching = false;
				}
			});
		});
	}

	initializeHeader() {
		this.hasNewNotification = false;
		this.hasNewMessage = false;
		this.userType = '';
		this.envVariable = environment;
		this.profile = {};
		this.isEmailVerified = false;
		this.isAccountApproved = false;
		this.loggedIn = this.authService.isLoginSubject.value;
		this.userId = this._cookieService.getValue('userId');
		console.log(this.userId);
		this.defaultProfileUrl = '/assets/images/default-user.jpg';
		this.isTeacher = false;
		this.makeOldNotification = [];
		this.joinedRooms = [];
		this.tempJoinedRooms = [];
		this.isSessionApproved = false;
		this.sessionId = '';
		this.isSearchBarVisible = false;
		this.getProfile();
		this.checkIfSessionApproved();
		this.getNotifications();
		this.getMessages();
	}

	getProfile() {
		if (this.loggedIn) {
			this._profileService.getCompactProfile(this.userId).subscribe(profile => {
				if (profile && profile.length > 0) {
					this.profile = profile[0];
					this.isEmailVerified = this.profile.peer[0].emailVerified;
					this.isAccountApproved = this.profile.peer[0].accountVerified;
					if (this.profile.peer[0].ownedCollections !== undefined && this.profile.peer[0].ownedCollections.length > 0) {
						this.isTeacher = true;
					}
					this.profileCompletionObject = this._profileService.getProfileProgressObject(this.profile);
					console.log(this.profileCompletionObject);
					/*if (this.router.url !== '/signup-social' && this.router.url !== '/verification/1' && this.profile.peer[0].identities && this.profile.peer[0].identities.length > 0 && (!this.profile.peer[0].phoneVerified || !this.profile.peer[0].emailVerified)) {
						// Incomplete Social signup. Redirect user to finish it.
						this.router.navigate(['signup-social']);
						this.snackBar.open('We need just a few more details before continuing. Redirecting you to finish signup...', 'OK', {
							duration: 5000
						});
					} else if (this.router.url !== '/verification/1' && (!this.profile.peer[0].identities || this.profile.peer[0].identities.length === 0) && (!this.profile.peer[0].phoneVerified || !this.profile.peer[0].emailVerified)) {
						this.router.navigate(['verification', '1']);
						this.snackBar.open('We need just a few more details before continuing. Redirecting you to finish signup...', 'OK', {
							duration: 5000
						});
					}*/
				}
			});
		} else {
			return null;
		}
	}

	public openSignup() {
		this.dialogsService.openSignup().subscribe();
	}


	public openLogin() {
		this.dialogsService.openLogin().subscribe();
	}

	public goToHome() {
		if (this.loggedIn) {
			/*if (this.profile.peer[0].identities && this.profile.peer[0].identities.length > 0 && (!this.profile.peer[0].phoneVerified || !this.profile.peer[0].emailVerified)) {
				// Incomplete Social signup. Redirect user to finish it.
				this.router.navigate(['signup-social']);
				this.snackBar.open('We need just a few more details before continuing. Redirecting you to finish signup...', 'OK', {
					duration: 5000
				});
			} else if ((!this.profile.peer[0].identities || this.profile.peer[0].identities.length === 0) && (!this.profile.peer[0].phoneVerified || !this.profile.peer[0].emailVerified)) {
				this.router.navigate(['verification', '1']);
				this.snackBar.open('We need just a few more details before continuing. Redirecting you to finish signup...', 'OK', {
					duration: 5000
				});
			} else {
				this.router.navigate(['home', 'homefeed']);
			}*/
			this.router.navigate(['home', 'homefeed']);
		} else {
			this.router.navigate(['/']);
		}
	}

	public getNotifications() {
		const filter = {
			'order': 'updatedAt DESC',
			'limit': 10
		};
		this._notificationService.getNotifications(this.userId, JSON.stringify(filter), (err, result) => {
			if (err) {
				console.log(err);
			} else {
				result.forEach(resultItem => {
					if (resultItem.new) {
						this.hasNewNotification = true;
						resultItem.new = false;
						resultItem.seen = true;
						delete resultItem.createdAt;
						delete resultItem.updatedAt;
						this.makeOldNotification.push(resultItem);
					}
				});
			}
		});
	}

	public getMessages() {
		if (this.userId) {
			this._inboxService.getRoomData(5)
				.subscribe((response) => {
					if (response) {
						this.sortFilterJoinedRooms(response);
						this.tempJoinedRooms = this.joinedRooms;
						// Join sockets of all the rooms this user is a part of.
						this._socketService.listenForNewMessage().subscribe(newMessage => {
							if (!(/\/console\/inbox\/.*./.test(this.router.url))) {
								const receivedInRoomIndex = this.joinedRooms.findIndex(room => (room.id === newMessage['roomId']));
								// If this room exists for the user and the message hasnt already been added to array
								if (receivedInRoomIndex !== -1 && !this.joinedRooms[receivedInRoomIndex].messages.find(message => (message.id === newMessage['id'])) && newMessage['peer'][0].id !== this.userId) {
									this.snackBar.open('New message from ' + this.ucwords.transform(newMessage['peer'][0].profiles[0].first_name) + ' in ' + this.ucwords.transform(this.joinedRooms[receivedInRoomIndex].name) + ': ' + newMessage['text'], 'View', {
										duration: 5000
									});
									this.joinedRooms[receivedInRoomIndex].messages.push(newMessage);
									this.sortFilterJoinedRooms(this.joinedRooms);
									this.messageNotification.nativeElement.play();
								}
							}
						});
					} else {
						console.log('No joined rooms!');
					}
				});
		}
	}

	public sortFilterJoinedRooms(response) {
		this.joinedRooms = response;
		this.joinedRooms.sort((a, b) => {
			return moment(b.messages[b.messages.length - 1].updatedAt).diff(moment(a.messages[a.messages.length - 1].updatedAt), 'seconds');
		});
		this.joinedRooms.forEach(joinedRoom => {
			joinedRoom = this._inboxService.formatDateTime(joinedRoom, this.userId);
			if (joinedRoom.unread) {
				this.hasNewMessage = true;
			}
			return joinedRoom;
		});
		this.tempJoinedRooms = this.joinedRooms;
	}

	// public openNotificationsDialog(): void {
	// 	const dialogRef = this.dialog.open(AppNotificationDialogComponent, {
	// 		width: '350px',
	// 		height: '70vh',
	// 		panelClass: 'responsive-fixed-position',
	// 		data: {
	// 		},
	// 		disableClose: false,
	// 		position: {
	// 			top: this.notificationsButton._elementRef.nativeElement.getBoundingClientRect().bottom + 8 + 'px',
	// 			left: this.notificationsButton._elementRef.nativeElement.getBoundingClientRect().left - 220 + 'px'
	// 		}
	// 	});

	// 	dialogRef.afterClosed().subscribe(result => {
	// 		if (this.makeOldNotification.length > 0) {
	// 			this.makeOldNotification.forEach(notifItem => {
	// 				this._notificationService.updateNotification(this.userId, notifItem, (err, patchResult) => {
	// 					if (err) {
	// 						console.log(err);
	// 					}
	// 				});
	// 			});
	// 			this.hasNewNotification = false;
	// 		}
	// 	});
	// }

	public openMessagesDialog(): void {
		const dialogRef = this.dialog.open(InboxDialogComponent, {
			width: '350px',
			height: '70vh',
			panelClass: 'responsive-fixed-position',
			data: {
			},
			disableClose: false,
			position: {
				top: this.messagesButton._elementRef.nativeElement.getBoundingClientRect().bottom + 8 + 'px',
				left: this.messagesButton._elementRef.nativeElement.getBoundingClientRect().left - 220 + 'px'
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			this.getMessages();
		});
	}

	public checkIfSessionApproved() {
		const query = {
			where: {
				and: [{ status: 'active' }, { type: 'session' }]
			}
		};
		this._collectionService.getOwnedCollections(this.userId, JSON.stringify(query), (err, result) => {
			if (!err && result && result.length > 0) {
				this.isSessionApproved = true;
				this.sessionId = result[0].id;
			} else {
				this.isSessionApproved = false;
			}
		});
	}

	public onSearchOptionClicked(option) {
		this.searchInputBar.value = '';
		this._searchService.onSearchOptionClicked(option);
	}

	public showSearchBar() {
		this.isSearchBarVisible = !this.isSearchBarVisible;
	}

	public openGenerateStoryDialog() {
		if (this.profile && this.profile.peer && this.profile.peer.length > 0) {
			this.router.navigate(['profile', this.profile.peer[0].id, 'story']);
		}
	}

	public createExperience() {
		// this.isLoggedIn.subscribe(res => {
		// 	if (res) {
		// 		this.router.navigateByUrl('/console/teaching/experiences');
		// 	} else {
		// 		this.dialogsService.openLogin().subscribe(result => {
		// 			if (result) {
		// 				this.router.navigateByUrl('/console/teaching/experiences');
		// 			}
		// 		});
		// 	}
		// });
		this.router.navigate(['digest', 'experiences']);
	}

	public createClass() {
		// this.isLoggedIn.subscribe(res => {
		// 	if (res) {
		// 		this.router.navigateByUrl('/console/teaching/classes');
		// 	} else {
		// 		this.dialogsService.openLogin().subscribe(result => {
		// 			if (result) {
		// 				this.router.navigateByUrl('/console/teaching/classes');
		// 			}
		// 		});
		// 	}
		// });
		this.router.navigate(['digest', 'experiences']);

	}

	public createSession() {
		this.router.navigate(['digest', 'peers']);

		// this.isLoggedIn.subscribe(res => {
		// 	if (res) {
		// 		this.router.navigateByUrl('/console/teaching/sessions');
		// 	} else {
		// 		this.dialogsService.openLogin().subscribe(result => {
		// 			if (result) {
		// 				this.router.navigateByUrl('/console/teaching/sessions');
		// 			}
		// 		});
		// 	}
		// });
	}

	public gotoCredit() {
		this.isLoggedIn.subscribe(res => {
			if (res) {
				this.router.navigateByUrl('/home');
			} else {
				this.dialogsService.openLogin().subscribe(result => {
					if (result) {
						this.router.navigateByUrl('/home');
					}
				});
			}
		});
	}

	public gotoBookmarks() {
		this.isLoggedIn.subscribe(res => {
			if (res) {
				this.router.navigateByUrl('/console/learning/bookmarks');
			} else {
				this.dialogsService.openLogin().subscribe(result => {
					if (result) {
						this.router.navigateByUrl('/console/learning/bookmarks');
					}
				});
			}
		});
	}

	public gotoConsoleLearning() {
		this.isLoggedIn.subscribe(res => {
			if (res) {
				this.router.navigateByUrl('/console/learning/all');
			} else {
				this.dialogsService.openLogin().subscribe(result => {
					if (result) {
						this.router.navigateByUrl('/console/learning/all');
					}
				});
			}
		});
	}
}
