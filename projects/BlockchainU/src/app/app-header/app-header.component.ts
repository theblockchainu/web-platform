import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import { Observable } from 'rxjs';
import { ProfileService } from '../_services/profile/profile.service';
import { FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogsService } from '../_services/dialogs/dialog.service';
import { NotificationService } from '../_services/notification/notification.service';
import { SearchService } from '../_services/search/search.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../_services/collection/collection.service';
import { InboxService } from '../_services/inbox/inbox.service';
import * as moment from 'moment';
import * as _ from 'lodash';
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
	public globalScholarship;

	ngOnInit() {
		this.options = [
			'ethereum',
			'hyperledger',
			'blockchain',
			'cryptography',
			'design thinking',
			'machine learning'
		];
		// Subscribe to the login observable. Executes when user logs in.
		this.authService.isLoginSubject.subscribe(res => {
			this.loggedIn = res;
			this.initializeHeader();
		});
		this.isLoggedIn = this.authService.isLoginSubject.asObservable();
		// Setup search box
		this.myControl.valueChanges.subscribe((value) => {
			this.options = [];
			if (value && value.length > 0) {
				this.searching = true;
				this._searchService.getAllSearchResults(this.userId, value, (err, result) => {
					if (!err) {
						this.options = result;
						this.searching = false;
					} else {
						console.log(err);
						this.searching = false;
					}
				});
			} else {
				this.searching = false;
				this.options = [
					'ethereum',
					'hyperledger',
					'blockchain',
					'cryptography',
					'design thinking',
					'machine learning'
				];
			}
		});
	}

	initializeHeader() {
		console.log('Initializing Header');
		this.hasNewNotification = false;
		this.hasNewMessage = false;
		this.userType = '';
		this.envVariable = environment;
		this.profile = {};
		this.isEmailVerified = false;
		this.isAccountApproved = false;
		this.userId = this._cookieService.getValue('userId');
		this.defaultProfileUrl = '/assets/images/default-user.jpg';
		this.isTeacher = false;
		this.makeOldNotification = [];
		this.joinedRooms = [];
		this.tempJoinedRooms = [];
		this.isSessionApproved = false;
		this.sessionId = '';
		this.isSearchBarVisible = false;
		this.getProfile();
		this.getNotifications();
		this.getMessages();
	}

	/**
	 * Get logged in user's profile and check if they are a teacher and registered to a global scholarship
	 * @returns {null}
	 */
	getProfile() {
		if (this.loggedIn) {
			this._profileService.getCompactProfile(this.userId)
				.subscribe((profile: any) => {
					if (profile && profile.length > 0) {
						this.profile = profile[0];
						this.isEmailVerified = this.profile.peer[0].emailVerified;
						this.isAccountApproved = this.profile.peer[0].accountVerified;
						if (this.profile.peer[0].ownedCollections !== undefined && this.profile.peer[0].ownedCollections.length > 0) {
							this.isTeacher = true;
							// Check if user's profile has been approved for mentor sessions
							if (_.find(this.profile.peer[0].ownedCollections, ownedCollection => ownedCollection.status === 'active' && ownedCollection.type === 'session')) {
								this.isSessionApproved = true;
								this.sessionId = _.find(this.profile.peer[0].ownedCollections, ownedCollection => ownedCollection.status === 'active' && ownedCollection.type === 'session').id;
							}
						}
						if (this.profile.peer[0].scholarships_joined && this.profile.peer[0].scholarships_joined.length > 0) {
							this.globalScholarship = _.find(this.profile.peer[0].scholarships_joined, scholarship => {
								return scholarship.type === 'public';
							});
						}
						this.profileCompletionObject = this._profileService.getProfileProgressObject(this.profile);
					}
				});
		} else {
			return null;
		}
	}

	/**
	 * Open sign-up dialog
	 */
	public openSignup() {
		this.dialogsService.openSignup('invite/1').subscribe();
	}

	/**
	 * Open login dialog
	 */
	public openLogin() {
		this.dialogsService.openLogin().subscribe();
	}

	/**
	 * Navigate to home page based on logged in status of user
	 */
	public goToHome() {
		if (this.loggedIn) {
			this.router.navigate(['home', 'homefeed']);
		} else {
			this.router.navigate(['/']);
		}
	}

	/**
	 * Get the last 10 notifications and check if there are unread notifications
	 */
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

	/**
	 * Fetch the latest 5 chat rooms and check if there are unread messages.
	 */
	public getMessages() {
		if (this.userId) {
			this._inboxService.getRoomData(5)
				.subscribe((response: any) => {
					if (response) {
						this.sortFilterJoinedRooms(response);
						this.tempJoinedRooms = this.joinedRooms;
						// Join sockets of all the rooms this user is a part of.
						this._socketService.listenForNewMessage().subscribe(newMessage => {
							if (!(/\/console\/inbox\/.*./.test(this.router.url))) {
								const receivedInRoomIndex = this.joinedRooms.findIndex(room => (room.id === newMessage['roomId']));
								// If this room exists for the user and the message hasn't already been added to array
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

	/**
	 * Sort and filter all rooms joined by the user based on the timeline of messages received.
	 * @param rooms List of all rooms joined by the user
	 */
	public sortFilterJoinedRooms(rooms) {
		this.joinedRooms = rooms;
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

	/**
	 * Open dialog to show Inbox messages and recent notifications
	 */
	public openMessagesDialog(): void {
		const dialogRef = this.dialog.open(InboxDialogComponent, {
			width: '350px',
			height: '70vh',
			panelClass: 'responsive-fixed-position',
			data: {},
			disableClose: false,
			position: {
				top: this.messagesButton._elementRef.nativeElement.getBoundingClientRect().bottom + 8 + 'px',
				left: this.messagesButton._elementRef.nativeElement.getBoundingClientRect().left - 220 + 'px'
			}
		});

		dialogRef.afterClosed().subscribe((result: any) => {
			this.getMessages();
		});
	}

	/**
	 * Trigger action on selection of particular search result.
	 * @param option The search result clicked on
	 */
	public onSearchOptionClicked(option) {
		this.searchInputBar.value = '';
		this._searchService.onSearchOptionClicked(option);
	}

	/**
	 * Toggle search bar visibility on and off
	 */
	public showSearchBar() {
		this.isSearchBarVisible = !this.isSearchBarVisible;
	}

	/**
	 * Open dialog to create a new Knowledge story of logged in user
	 */
	public openGenerateStoryDialog() {
		if (this.profile && this.profile.peer && this.profile.peer.length > 0) {
			this.router.navigate(['profile', this.profile.peer[0].id, 'story']);
		}
	}

	/**
	 * Navigate to console > teaching > experiences
	 * Create a new in-person workshop
	 */
	public createExperience() {
		if (this.isTeacher) {
			this.router.navigate(['console', 'teaching', 'experiences']);
		} else {
			this.router.navigate(['digest', 'experiences']);
		}
	}

	/**
	 * Navigate to console > teaching > classes
	 * Create a new Online course
	 */
	public createClass() {
		if (this.isTeacher) {
			this.router.navigate(['console', 'teaching', 'classes']);
		} else {
			this.router.navigate(['digest', 'classes']);
		}

	}

	/**
	 * Navigate to console > teaching > sessions
	 * Create a new mentor profile for sessions
	 */
	public createSession() {
		if (this.isTeacher) {
			this.router.navigate(['console', 'teaching', 'sessions']);
		} else {
			this.router.navigate(['digest', 'peers']);
		}
	}

	/**
	 * Navigate to /home
	 */
	public gotoCredit() {
		if (this.loggedIn) {
			this.router.navigateByUrl('/home');
		} else {
			this.dialogsService.openLogin().subscribe((result: any) => {
				if (result) {
					this.router.navigateByUrl('/home');
				}
			});
		}
	}

	/**
	 * Navigate to Console > Learning > Bookmarks
	 */
	public gotoBookmarks() {
		if (this.loggedIn) {
			this.router.navigateByUrl('/console/learning/bookmarks');
		} else {
			this.dialogsService.openLogin().subscribe((result: any) => {
				if (result) {
					this.router.navigateByUrl('/console/learning/bookmarks');
				}
			});
		}
	}

	/**
	 * Navigate to Console > Learning section
	 */
	public gotoConsoleLearning() {
		if (this.loggedIn) {
			this.router.navigateByUrl('/console/learning/all');
		} else {
			this.dialogsService.openLogin().subscribe((result: any) => {
				if (result) {
					this.router.navigateByUrl('/console/learning/all');
				}
			});
		}
	}

	/**
	 * Open dialog to ask a quesiton within selected community
	 */
	public askQuestion() {
		this.dialogsService.askQuestion();
	}

	/**
	 * Navigate to Medium Blog
	 */
	public openBlog() {
		window.location.href = 'https://medium.com/theblockchainu';
	}
}
