import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { CollectionService } from '../../../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-intro-card',
  templateUrl: './intro-card.component.html',
  styleUrls: ['./intro-card.component.scss']
})
export class IntroCardComponent implements OnChanges, OnInit {

  @Input() learningPath: any;
  envVariable: any;
  totalHours: number;
  joining: boolean;
  @Input() joined: boolean;
  @Output() joinedChange = new EventEmitter<boolean>();
  public maxLength: number;

  constructor(
    private _collectionService: CollectionService,
    private _cookieUtilsService: CookieUtilsService,
    private _dialogsService: DialogsService,
    private matSnackBar: MatSnackBar) { }


  ngOnChanges() {
    this.calculateLearningHours();
  }

  ngOnInit() {
    this.envVariable = environment;
    this.maxLength = 200;
  }

  private calculateLearningHours() {
    this.totalHours = 0;
    this.learningPath.contents.forEach(content => {
      this.totalHours += content.courses[0].totalHours;
    });
  }

  join() {
    this.joining = true;
    const userId = this._cookieUtilsService.getValue('userId');
    if (userId && userId.length > 2) {
      this._collectionService.addParticipant(this.learningPath.id, userId).subscribe(res => {
        if (res) {
          this.joining = false;
          this.joined = true;
        }
      });
    } else {
      this._dialogsService.openLogin().subscribe(res => {
        if (res) {
          this.join();
        } else {
          this.matSnackBar.open('You need to signup or sign in to join this learning path');
          this.joining = false;
        }
      });
    }
  }

  leave() {
    this.joining = true;
    const userId = this._cookieUtilsService.getValue('userId');
    this._collectionService.removeParticipant(this.learningPath.id, userId).subscribe(res => {
      this.joined = false;
      this.joining = false;
    });
  }

  share() {
    this._dialogsService.shareCollection('learning-path',
      this.learningPath.id, this.learningPath.title, this.learningPath.description, this.learningPath.headline,
      this.learningPath.imageUrls[0], null, null, this.learningPath.customUrl).subscribe();
  }

  public showAll(strLength) {
    if (strLength > this.maxLength) {
      this.maxLength = strLength;
    } else {
      this.maxLength = 200;
    }
  }



}
