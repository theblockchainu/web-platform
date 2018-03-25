import { Component, OnInit, Inject, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import * as Video from 'twilio-video';
import {environment} from '../../../../environments/environment';
import { TwilioServicesService } from '../../twlio_services/twilio-services.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { SocketService } from '../../socket/socket.service';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-live-session-dialog',
  templateUrl: './live-session-dialog.component.html',
  styleUrls: ['./live-session-dialog.component.scss']
})
export class LiveSessionDialogComponent implements OnInit, OnDestroy {
  private token: string;
  private roomName: string;
  public room: any;
  public mainLoading: boolean;
  public startedView;
  public userId;
  public isTeacherView = false;
  public registeredParticipantMapObj: any;
  public localAudioTrack: any;
  public localVideoTrack: any;
  public localParticipantId: string;
  public envVariable;
  @ViewChild('mainStream') mainStream: ElementRef;
  @ViewChild('otherStream') otherStream: ElementRef;
  @ViewChild('localStream') localStream: ElementRef;
  @ViewChild('otherStreamTeacher') otherStreamTeacher: ElementRef;

  constructor(
    private _twilioServicesService: TwilioServicesService,
    public dialogRef: MatDialogRef<LiveSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private renderer: Renderer2,
    private cookieUtilsService: CookieUtilsService,
    private _socketService: SocketService,
    private router: Router,
    private _titleCase: TitleCasePipe
  ) {
      this.envVariable = environment;
    this.userId = cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.registeredParticipantMapObj = {};
    this.dialogData.participants.forEach(participant => {
      this.registeredParticipantMapObj[participant.id] = participant;
    });
    this.mainLoading = true;
    this._twilioServicesService.getToken().subscribe(
      (result: any) => {
        this.token = result.token;
        this.roomName = this.dialogData.roomName;
        this.createRoom();
      }
    );
    this.recordSessionStart();
  }

  ngOnDestroy() {
    this.recordSessionEnd();
  }

  private createRoom() {
    Video.connect(this.token, {
      name: this.roomName,
      audio: { name: 'microphone' },
      video: {
        width: 1280,
        name: 'camera'
      }
    }).then((createdRoom) => {
      this.room = createdRoom;
      console.log('Connected to Room "%s"', this.room.name);
      this.setUpLocalParticipant();
      this.setUpRemoteParticipants();
    }, (error) => {
      console.error('Unable to connect to Room: ' + error.message);
    });
  }

  private setUpRemoteParticipants() {
    this.room.participants.forEach(participant => this.participantConnected(participant));
    this.room.on('participantConnected', participant => this.participantConnected(participant));
    this.room.on('participantDisconnected', participant => this.participantDisconnected(participant));
  }

  private setUpLocalParticipant() {
    const localParticipant = this.room.localParticipant;
    this.isTeacherView = (localParticipant.identity === this.dialogData.teacher.id);
    this.localParticipantId = localParticipant.identity;
    const localDiv = this.renderer.createElement('div');
    localDiv.id = localParticipant.identity;
    localDiv.appendChild(this.participantImage(localParticipant, this.isTeacherView));
    localDiv.appendChild(this.participantName(localParticipant, this.isTeacherView));
    if (this.isTeacherView) {
      this.mainLoading = false;
      localDiv.className = 'teacher-box';
      this.renderer.appendChild(this.mainStream.nativeElement, localDiv);
    } else {
      localDiv.className = 'participant-box';
      this.renderer.appendChild(this.localStream.nativeElement, localDiv);
    }
    localParticipant.tracks.forEach(track => {
      if (track.kind === 'audio') {
        this.localAudioTrack = track;
        this.replaceTrack(localParticipant, this.localAudioTrack);
      } else if (track.kind === 'video') {
        this.localVideoTrack = track;
        this.replaceTrack(localParticipant, this.localVideoTrack);
      }
    });
  }

  private participantConnected(remoteParticipant: any) {
    console.log('Connected participant: ' + remoteParticipant.identity);
    const isTeacher = (remoteParticipant.identity === this.dialogData.teacher.id);
    const remoteDiv = this.renderer.createElement('div');
    remoteDiv.id = remoteParticipant.identity;
    remoteDiv.appendChild(this.participantImage(remoteParticipant, isTeacher));
    remoteDiv.appendChild(this.participantName(remoteParticipant, isTeacher));
    if (this.isTeacherView) {
      remoteDiv.className = 'participant-box';
      this.renderer.appendChild(this.otherStreamTeacher.nativeElement, remoteDiv);
    } else {
      if (isTeacher) {
        this.mainLoading = false;
        remoteDiv.className = 'teacher-box';
        this.renderer.appendChild(this.mainStream.nativeElement, remoteDiv);
      } else {
        remoteDiv.className = 'participant-box';
        this.renderer.appendChild(this.otherStream.nativeElement, remoteDiv);
      }
    }
    remoteParticipant.on('trackAdded', track => {
      if (track.kind === 'video') {
        track.on('disabled', remoteVideoTrack => {
          console.log('Participant ' + remoteParticipant.identity + ' disabled video');
          this.remoteVideoDisabled(remoteParticipant, track);
        });
        track.on('enabled', remoteVideoTrack => {
          console.log('Participant ' + remoteParticipant.identity + ' enabled video');
          this.remoteVideoEnabled(remoteParticipant, track);
        });
      }
      this.replaceTrack(remoteParticipant, track);
    });
    remoteParticipant.on('trackRemoved', track => {
      console.log('track removed');
      this.removeTrack(remoteParticipant, track);
    });
  }

  private participantDisconnected(participant: any) {
    console.log('Participant "%s" disconnected', participant.identity);
    this.removeParticipant(participant);
  }

  private recordSessionStart() {
    const view = {
      type: 'user',
      url: this.router.url,
      ip_address: '',
      browser: '', // this.deviceService.getDeviceInfo().browser,
      viewedModelName: 'content',
      startTime: new Date(),
      content: this.dialogData.content,
      viewer: {
        id: this.userId
      }
    };
    this._socketService.sendStartView(view);
    this._socketService.listenForViewStarted().subscribe(startedView => {
      this.startedView = startedView;
      console.log(startedView);
    });
  }

  private recordSessionEnd() {
    this.startedView.viewer = {
      id: this.userId
    };
    this.startedView.endTime = new Date();
    this._socketService.sendEndView(this.startedView);
    this._socketService.listenForViewEnded().subscribe(endedView => {
      delete this.startedView;
      console.log(endedView);
    });
  }

  /**
   * toggleVideo
   */
  public toggleVideo() {
    if (this.localVideoTrack.isEnabled) {
      this.localVideoTrack.disable();
      const localDiv = document.getElementById(this.localParticipantId);
      const tracks = <HTMLCollection>localDiv.children;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks.item(i).localName === 'video') {
          this.renderer.setStyle(tracks.item(i), 'z-index', '-1');
        }
      }
    } else {
      this.localVideoTrack.enable();
      const localDiv = document.getElementById(this.localParticipantId);
      const tracks = <HTMLCollection>localDiv.children;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks.item(i).localName === 'video') {
          this.renderer.setStyle(tracks.item(i), 'z-index', '0');
        }
      }
    }
  }

  /**
   * toggleAudio
   */
  public toggleAudio() {
    if (this.localAudioTrack.isEnabled) {
      this.localAudioTrack.disable();
    } else {
      this.localAudioTrack.enable();
    }
  }


  /**
   * remoteVideoToggled
   */
  public remoteVideoEnabled(remoteParticipant: any, toggledTrack: any) {
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
  public remoteVideoDisabled(remoteParticipant: any, toggledTrack: any) {
    const localDiv = document.getElementById(remoteParticipant.identity);
    const tracks = <HTMLCollection>localDiv.children;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks.item(i).localName === 'video') {
        this.renderer.setStyle(tracks.item(i), 'z-index', '-1');
      }
    }
  }

  private participantImage(participant: any, isTeacher: boolean) {
    const img = new Image();
    if (isTeacher) {
      img.className = 'circle-thumb teacherStreamImage';
      if ((participant.identity === this.dialogData.teacher.id) && this.dialogData.teacher.profiles[0].picture_url) {
        img.src = environment.apiUrl + this.dialogData.teacher.profiles[0].picture_url;
      } else {
        img.src = '../../../assets/images/avatar.png';
      }
    } else {
      img.className = 'circle-thumb otherStreamImage';
      console.log('identity' + participant.identity);
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
      par.innerText = this._titleCase.transform(this.dialogData.teacher.profiles[0].first_name);
    } else if (participant.identity in this.registeredParticipantMapObj) {
      par.className = 'studentName';
      par.innerText = this._titleCase.transform(this.registeredParticipantMapObj[participant.identity].profiles[0].first_name);
    } else {
      par.innerText = 'Not Registered';
    }
    console.log(par);
    return par;
  }

  private replaceTrack(participant: any, track: any) {
    const el = document.getElementById(participant.identity);
    const tracks = <HTMLCollection>el.children;
    let trackFound = false;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks.item(i).localName === track.kind) {
        this.renderer.removeChild(el, tracks.item(i));
        this.renderer.appendChild(el, track.attach());
        trackFound = true;
      }
    }
    if (!trackFound) {
      this.renderer.appendChild(el, track.attach());
    }
  }

  private removeTrack(participant: any, track: any) {
    const el = document.getElementById(participant.identity);
    const tracks = <HTMLCollection>el.children;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks.item(i).localName === track.kind) {
        this.renderer.removeChild(el, tracks.item(i));
      }
    }
  }

  private removeParticipant(remoteParticipant: any) {
    remoteParticipant.tracks.forEach(track => {
      if (track.kind === 'audio' || track.kind === 'video') { track.detach(); }
    });
    const el = document.getElementById(remoteParticipant.identity);
    if (this.isTeacherView) {
      this.renderer.removeChild(this.otherStreamTeacher, el);
    } else {
      if (remoteParticipant.identity === this.dialogData.teacher.id) {
        this.renderer.removeChild(this.mainStream, el);
      } else {
        this.renderer.removeChild(this.otherStream, el);
      }
    }
  }

  public endCall() {
    this.room.disconnect();
    this.dialogRef.close();
  }
}
