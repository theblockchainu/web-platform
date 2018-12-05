import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { connect, Room, createLocalTracks, LocalTrack, Participant, TrackPublication, RemoteTrack, RemoteTrackPublication, RemoteVideoTrack, LocalAudioTrack, LocalVideoTrack, RemoteParticipant, Track, LocalTrackPublication, LocalParticipant } from 'twilio-video';
import { ActivatedRoute, Router } from '@angular/router';
import { TwilioServicesService } from '../../_services/twlio_services/twilio-services.service';
import { from, Observable, fromEvent } from 'rxjs';
import { map, flatMap, catchError, first } from 'rxjs/operators';
import { ConsoleTeachingClassComponent } from '../../console/console-teaching/console-teaching-class/console-teaching-class.component';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { TitleCasePipe } from '@angular/common';
import { ContentService } from '../../_services/content/content.service';
import { ProfileService } from '../../_services/profile/profile.service';

declare var chrome;

@Component({
  selector: 'app-live-session',
  templateUrl: './live-session.component.html',
  styleUrls: ['./live-session.component.scss']
})
export class LiveSessionComponent implements OnInit {
  localAudioTrack: LocalAudioTrack;
  localVideoTrack: LocalVideoTrack;
  loaded: boolean;
  roomId: string;
  token: string;
  room: Room;
  localTracks: Array<LocalTrack>;
  screenTrack: any;
  isTeacher: boolean;
  teacher: any;
  registeredParticipantMapObj: any;
  contentId: string;
  calendarId: string;
  userId: string;
  localParticipant: any;

  @ViewChild('mainStream') mainStream: ElementRef;
  @ViewChild('otherStream') otherStream: ElementRef;
  @ViewChild('localStream') localStream: ElementRef;
  @ViewChild('otherStreamTeacher') otherStreamTeacher: ElementRef;

  constructor(
    private _twilioServicesService: TwilioServicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    private _contentService: ContentService,
    private _cookieUtilsService: CookieUtilsService,
    private _titleCase: TitleCasePipe,
    private _profileService: ProfileService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.contentId = params['contentId'];
      this.calendarId = params['calendarId'];
      if (this.contentId && this.calendarId) {
        this.roomId = this.contentId + this.calendarId;
      } else if (this.contentId) {
        this.roomId = this.contentId;
      } else {
        console.log('Invalid Room');
      }
      this.startSession();
    });
  }

  private startSession() {
    this.setUpVariables();
    this.fetchLocalParticipant()
      .pipe(
        flatMap(localParticipant => {
          console.log('localparticipant' + localParticipant);
          return this.fetchSessionData();
        }),
        flatMap(sessionData => {
          console.log(sessionData);
          return this.getToken();
        }),
        flatMap(token => {
          console.log(token);
          return this.createTracks();
        }),
        flatMap(localtracks => {
          console.log(localtracks);
          return this.connectToRoom();
        }),
        flatMap(roomSetupComplete => {
          console.log(roomSetupComplete);
          return this.setUpLocalParticipant();
        }),
        flatMap(LocalParticipantSetupComplete => {
          console.log('LocalParticipantSetupComplete ' + LocalParticipantSetupComplete);
          return this.setupParticipants();
        })
      ).subscribe(res => {
        this.loaded = true;
      }, err => {
        this.loaded = true;
        console.log(err);
      });
  }

  setUpVariables() {
    this.loaded = false;
    this.registeredParticipantMapObj = {};
    this.isTeacher = false;
  }

  fetchLocalParticipant() {
    this.userId = this._cookieUtilsService.getValue('userId');
    const filter = {
      'include': [
        'profiles'
      ]
    };

    return this._profileService.getPeerData(this.userId, filter).pipe(map(res => {
      this.localParticipant = res;
    }));
  }

  fetchSessionData() {
    if (this.contentId && this.contentId.length > 0) {
      const query = {
        include: [
          { 'peers': 'profiles' },
          { 'collections': [{ 'owners': 'profiles' }] }
        ],
      };
      return this._contentService.getContentById(this.contentId, query).pipe(
        map((session: any) => {
          this.teacher = session.collections[0].owners[0];
          if (this.teacher.id === this.userId) {
            this.isTeacher = true;
          }
          session.peers.forEach(peer => {
            this.registeredParticipantMapObj[peer.id] = peer;
          });
          return session;
        })
      );
    } else {
      return new Observable(obs => {
        obs.error('Session Not Found');
      });
    }

  }

  private createTracks() {
    return from(createLocalTracks({
      audio: true,
      video: { width: 1280 }
    })).pipe(
      first(),
      map(
        localTracks => {
          this.localTracks = localTracks;
          return this.localTracks;
        }
      ), catchError(err => {
        return new Observable(obs => {
          obs.error('createLocalTracks');
        });
      }));
  }

  private setUpLocalParticipant() {
    const localParticipant = this.room.localParticipant;
    const localDiv = this.renderer.createElement('div');
    localDiv.id = localParticipant.identity;
    localDiv.appendChild(this.participantImage(localParticipant, this.isTeacher));
    localDiv.appendChild(this.participantName(localParticipant, this.isTeacher));
    if (this.isTeacher) {
      localDiv.className = 'teacher-box';
      this.renderer.appendChild(this.mainStream.nativeElement, localDiv);
    } else {
      localDiv.className = 'participant-box';
      this.renderer.appendChild(this.localStream.nativeElement, localDiv);
    }
    localParticipant.tracks.forEach(publication => {
      if (publication.kind === 'audio') {
        this.localAudioTrack = <LocalAudioTrack>publication.track;
        this.replaceLocalTrack(localParticipant, this.localAudioTrack);
      } else if (publication.kind === 'video') {
        this.localVideoTrack = <LocalVideoTrack>publication.track;
        this.replaceLocalTrack(localParticipant, this.localVideoTrack);
      }
    });
    return new Observable(obs => {
      obs.next(true);
    });
  }

  private connectToRoom() {
    return from(
      connect(this.token,
        {
          name: this.roomId,
          tracks: this.localTracks
        }
      )
    ).pipe(
      first(),
      map(room => {
        this.room = room;
        return room;
      }), catchError(error => {
        console.error(`Unable to connect to Room: ${error.message}`);
        return new Observable(obs => { obs.next(false); });
      }));
  }

  private getToken() {
    return this._twilioServicesService.getToken().pipe(
      first(),
      map(
        (result: any) => {
          this.token = result.token;
          return this.token;
        }
      ));
  }

  private setupParticipants() {

    // Log your Client's LocalParticipant in the Room
    const localParticipant = this.room.localParticipant;
    console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);


    // Record any Participants already connected to the Room
    this.room.participants.forEach(participant => {
      console.log(`Participant "${participant.identity}" is connected to the Room`);
      this.participantConnected(participant);
    });

    // // Record Participants connected to the Room
    // fromEvent(this.room, 'participantConnected').pipe(first()).subscribe((participant: RemoteParticipant) => {
    //   console.log(`Participant "${participant.identity}" has connected to the Room`);
    //   this.participantConnected(participant);
    // });

    // // Record Participants disconnected from the Room

    // fromEvent(this.room, 'participantDisconnected').pipe(first()).subscribe((participant: Participant) => {
    //   console.log(`Participant "${participant.identity}" has disconnected from the Room`);
    //   this.participantDisconnected(participant);

    // });

    // Record Participants as they connect to the Room

    fromEvent(this.room, 'participantConnected').subscribe((participant: RemoteParticipant) => {
      console.log(`Participant connected: ${participant.identity}`);
      this.participantConnected(participant);
    });

    // Record Participants as they disconnect to the Room

    fromEvent(this.room, 'participantDisconnected').subscribe((participant: Participant) => {
      console.log(`Participant disconnected: ${participant.identity}`);
      this.participantDisconnected(participant);
    });

    return new Observable(obs => {
      obs.next(true);
    });
  }

  private setUpRemoteParticipant(participant: RemoteParticipant) {
    console.log('Settin up Remote Participant ' + participant.identity);
    console.log(participant.tracks);
    participant.tracks.forEach((publication: RemoteTrackPublication) => {
      this.publishRemoteTrack(publication.track, participant);
    });
    fromEvent(participant, 'trackPublished').subscribe((publishedTrack: RemoteTrackPublication) => {

      this.publishRemoteTrack(publishedTrack.track, participant);

    });

    fromEvent(participant, 'trackUnpublished').subscribe((publishedTrack: RemoteTrackPublication) => {
      this.unPublishRemoteTrack(publishedTrack.track, participant);
    });

  }

  private publishRemoteTrack(track: RemoteTrack, participant: RemoteParticipant) {
    console.log('Publishing Remote Track ' + participant.identity);
    console.log(track);
    fromEvent(track, 'disabled').subscribe(disabled => {
      console.log('Participant ' + participant.identity + ' disabled video');
      this.remoteVideoDisabled(participant);
    });

    fromEvent(track, 'enabled').subscribe(enabled => {
      console.log('Participant ' + participant.identity + ' enabled video');
      this.remoteVideoEnabled(participant);
    });
    this.replaceRemoteTrack(participant, track);
  }

  private unPublishRemoteTrack(track: RemoteTrack, participant: RemoteParticipant) {
    const el = document.getElementById(participant.identity);
    const tracks = <HTMLCollection>el.children;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks.item(i).localName === track.kind) {
        this.renderer.removeChild(el, tracks.item(i));
      }
    }
  }

  private replaceRemoteTrack(participant: RemoteParticipant, track: RemoteTrack) {
    console.log('Replacing Remote Track ' + participant.identity);
    const el = document.getElementById(participant.identity);
    const tracks = <HTMLCollection>el.children;
    let trackFound = false;
    for (let i = 0; i < tracks.length; i++) {
      if (track && tracks.item(i).localName === track.kind && (track.kind === 'audio' || track.kind === 'video')) {
        this.renderer.removeChild(el, tracks.item(i));
        this.renderer.appendChild(el, track.attach());
        trackFound = true;
      }
    }
    if (!trackFound && (track.kind === 'audio' || track.kind === 'video')) {
      this.renderer.appendChild(el, track.attach());
      console.log('appended');
    }
  }

  private replaceLocalTrack(participant: LocalParticipant, track: LocalTrack) {
    const el = document.getElementById(participant.identity);
    const tracks = <HTMLCollection>el.children;
    let trackFound = false;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks.item(i).localName === track.kind && (track.kind === 'audio' || track.kind === 'video')) {
        this.renderer.removeChild(el, tracks.item(i));
        this.renderer.appendChild(el, track.attach());
        trackFound = true;
      }
    }
    if (!trackFound && (track.kind === 'audio' || track.kind === 'video')) {
      this.renderer.appendChild(el, track.attach());
    }
  }

  /**
   * remoteVideoToggled
   */
  public remoteVideoEnabled(remoteParticipant: any) {
    const localDiv = document.getElementById(remoteParticipant.identity);
    const tracks = <HTMLCollection>localDiv.children;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks.item(i).localName === 'video') {
        this.renderer.setStyle(tracks.item(i), 'z-index', '0');
      }
    }

  }

  /**
  * remoteVideoToggled
  */
  public remoteVideoDisabled(remoteParticipant: RemoteParticipant) {
    const localDiv = document.getElementById(remoteParticipant.identity);
    const tracks = <HTMLCollection>localDiv.children;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks.item(i).localName === 'video') {
        this.renderer.setStyle(tracks.item(i), 'z-index', '-1');
      }
    }
  }

  endCall() {
    // To disconnect from a Room
    this.room.disconnect();
    this.exitSession();
  }

  /**
   * toggleAudio
   */
  public toggleLocalAudio() {
    if (this.localAudioTrack.isEnabled) {
      this.localAudioTrack.disable();
    } else {
      this.localAudioTrack.enable();
    }
  }

  /**
   * toggleVideo
   */
  public toggleLocalVideo() {
    if (this.localVideoTrack.isEnabled) {
      this.localVideoTrack.disable();
      const localDiv = document.getElementById(this.userId);
      const tracks = <HTMLCollection>localDiv.children;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks.item(i).localName === 'video') {
          this.renderer.setStyle(tracks.item(i), 'z-index', '-1');
        }
      }
    } else {
      this.localVideoTrack.enable();
      const localDiv = document.getElementById(this.userId);
      const tracks = <HTMLCollection>localDiv.children;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks.item(i).localName === 'video') {
          this.renderer.setStyle(tracks.item(i), 'z-index', '0');
        }
      }
    }
  }

  toggleLocalScreenShare() {
    if (this.screenTrack) {
      this.room.localParticipant.unpublishTrack(this.screenTrack);
      this.screenTrack = null;
    } else {
      this.getUserScreen(['window', 'screen', 'tab'], 'ommmoafgldpmnmmncooncpkhjhkfhppb').subscribe((stream: MediaStream) => {
        this.screenTrack = new LocalVideoTrack(stream.getVideoTracks()[0]);
        this.room.localParticipant.publishTrack(this.screenTrack);
        console.log(this.screenTrack);
      });
    }
  }

  private exitSession() {
    if (this.isTeacher) {
      this.router.navigate(['console', 'teaching', 'sessions']);
    } else {
      this.router.navigate(['console', 'learning', 'sessions']);
    }
  }

  private participantConnected(remoteParticipant: RemoteParticipant) {
    console.log(remoteParticipant);
    console.log('Connected participant: ' + remoteParticipant.identity);
    const isTeacher = (remoteParticipant.identity === this.teacher.id);
    const remoteDiv = this.renderer.createElement('div');
    remoteDiv.id = remoteParticipant.identity;
    remoteDiv.appendChild(this.participantImage(remoteParticipant, isTeacher));
    remoteDiv.appendChild(this.participantName(remoteParticipant, isTeacher));
    if (this.isTeacher) {
      remoteDiv.className = 'participant-box';
      this.renderer.appendChild(this.otherStreamTeacher.nativeElement, remoteDiv);
    } else {
      if (isTeacher) {
        remoteDiv.className = 'teacher-box';
        this.renderer.appendChild(this.mainStream.nativeElement, remoteDiv);
      } else {
        remoteDiv.className = 'participant-box';
        this.renderer.appendChild(this.otherStream.nativeElement, remoteDiv);
      }
    }
    this.setUpRemoteParticipant(remoteParticipant);
  }

  private participantImage(participant: any, isTeacher: boolean) {
    const img = new Image();
    if (isTeacher) {
      img.className = 'circle-thumb teacherStreamImage';
      if ((participant.identity === this.teacher.id) && this.teacher.profiles[0].picture_url) {
        img.src = environment.apiUrl + this.teacher.profiles[0].picture_url;
      } else {
        img.src = '../../../assets/images/avatar.png';
      }
    } else {
      img.className = 'circle-thumb otherStreamImage';
      if ((participant.identity in this.registeredParticipantMapObj)
        && this.registeredParticipantMapObj[participant.identity].profiles[0].picture_url) {
        img.src = environment.apiUrl + this.registeredParticipantMapObj[participant.identity].profiles[0].picture_url;
      } else {
        img.src = '../../../assets/images/avatar.png';
      }
    }
    return img;
  }

  private participantName(participant, isTeacher: boolean) {
    const par = this.renderer.createElement('span');
    if (isTeacher) {
      par.className = 'sessionTeacherName';
      par.innerText = this._titleCase.transform(this.teacher.profiles[0].first_name);
    } else if (participant.identity in this.registeredParticipantMapObj) {
      par.className = 'studentName';
      par.innerText = this._titleCase.transform(this.registeredParticipantMapObj[participant.identity].profiles[0].first_name);
    } else {
      par.innerText = 'Not Registered';
    }
    return par;
  }

  private participantDisconnected(participant: any) {
    console.log('Participant "%s" disconnected', participant.identity);
    this.removeParticipant(participant);
  }

  private removeParticipant(remoteParticipant: any) {
    remoteParticipant.tracks.forEach((trackPublished: RemoteTrackPublication) => {
      const track = trackPublished.track;
      if (track && (track.kind === 'audio' || track.kind === 'video')) {
        track.detach();
      }
    });
    const el = document.getElementById(remoteParticipant.identity);
    if (this.isTeacher) {
      this.renderer.removeChild(this.otherStreamTeacher, el);
    } else {
      if (remoteParticipant.identity === this.teacher.id) {
        this.renderer.removeChild(this.mainStream, el);
      } else {
        this.renderer.removeChild(this.otherStream, el);
      }
    }
  }

  /**
 * Get a MediaStream containing a MediaStreamTrack that represents the user's
 * screen.
 * 
 * This function sends a "getUserScreen" request to our Chrome Extension which,
 * if successful, responds with the sourceId of one of the specified sources. We
 * then use the sourceId to call getUserMedia.
 * 
 * @param {Array<DesktopCaptureSourceType>} sources
 * @param {string} extensionId
 * @returns {Promise<MediaStream>} stream
 */
  getUserScreen(sources, extensionId) {
    const request = {
      type: 'getUserScreen',
      sources: sources
    };
    return new Observable(obs => {
      chrome.runtime.sendMessage(extensionId, request, response => {
        switch (response.type) {
          case 'success':
            obs.next(response.streamId);
            break;
          case 'error':
            obs.error(new Error(response.message));
            break;
          default:
            obs.error(new Error('Unknown response'));
            break;
        }
      });
    }).pipe(
      flatMap(streamId => {
        return from(navigator.mediaDevices.getUserMedia({
          video: {
            // @ts-ignore: Media source support
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: streamId,
              maxWidth: 1920,
              maxHeight: 1080,
              maxFrameRate: 30,
              minAspectRatio: 1.77
            }
          }
        }));
      })
      , catchError(err => {
        return new Observable(obs => {
          obs.error('getUserMedia');
        });
      })

    );
  }


}
