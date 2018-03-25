import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsoleComponent } from '../console.component';
import { InboxService } from '../../_services/inbox/inbox.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import {SocketService} from '../../_services/socket/socket.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-console-inbox',
  templateUrl: './console-inbox.component.html',
  styleUrls: ['./console-inbox.component.scss']
})
export class ConsoleInboxComponent implements OnInit {
  public loadingMessages = false;
  public joinedRooms = [];
  public tempJoinedRooms = [];
  public experienceCollection = [];
  public workshopCollection = [];
  public defaultLoadedChat;
  public userId;
  private key = 'userId';
  public displayNone = [];
  public selected = '';
  public message = '';
  public envVariable;

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleComponent: ConsoleComponent,
    public _inboxService: InboxService,
    public _socketService: SocketService,
    private _cookieUtilsService: CookieUtilsService
  ) {
      this.envVariable = environment;
    activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleComponent.setActiveTab(urlSegment[0].path);
    });
    this.userId = this._cookieUtilsService.getValue(this.key);
  }

  ngOnInit() {
    this._inboxService.getRoomData()
      .subscribe((response) => {
        console.log(response);
        this.joinedRooms = response;

        this.joinedRooms.sort((a, b) => {
          return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
        });
        console.log(this.joinedRooms);
        if (this.joinedRooms) {
          let room = this.joinedRooms[0];
          room = this.formatDateTime(room);
          this.displayNone.push[room.id] = false;
          this.defaultLoadedChat = room;
          this._socketService.joinRoom(room.id);
        }
        this.tempJoinedRooms = this.joinedRooms;
        this.getCollections();
        this.selected = 'all';
      });
  }

  public openChat(room) {
    room = this.formatDateTime(room);
    this.defaultLoadedChat = room;
    this.displayNone.push[room.id] = false;
    this._socketService.joinRoom(room.id);
  }

  private formatDateTime(room) {
    let participantTextHeader = '';
    const participantTextHeaderSub = '';
    if (room.participants) {
      if (room.participants.length > 2) {
        for (let i = 0; i < room.participants.length; i++) {
          if ( i < 2) {
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
        if (moment(msg.createdAt).format('MMM D YYYY') === moment().format('MMM D YYYY')) {
          msg.createdAtLocal = 'Today';
          msg.leftColLatestMsgTime = moment(msg.createdAt).format('LT');
        } else {
          msg.createdAtLocal = moment(msg.createdAt).format('ddd, MMM D YYYY');
          msg.leftColLatestMsgTime = moment(msg.createdAt).format('ddd');
        }
      });
    }
    return room;
  }

  public postMsg(roomId) {
    const body = {
      'text' : this.message,
      'type' : 'user'
    };
    this._inboxService.postMessage(roomId, body)
      .subscribe((response) => {
        console.log('Posted');
      });
  }

  public imgErrorHandler(event) {
    event.target.src = '/assets/images/placeholder-image.jpg';
  }

  public getCollections() {
    this.joinedRooms.forEach(element => {
      this.experienceCollection = _.filter(element.collection, function(o) { return o.type === 'experience'; });
    });

    this.joinedRooms.forEach(element => {
      this.workshopCollection = _.filter(element.collection, function(o) { return o.type === 'workshop'; });
    });
  }

  public getSelectedCollection() {
    if (this.selected === 'workshop') {
      this.tempJoinedRooms = this.workshopCollection;
    } else if (this.selected === 'experience') {
      this.tempJoinedRooms = this.experienceCollection;
    } else {
      this.tempJoinedRooms = this.joinedRooms;
    }
  }
}
