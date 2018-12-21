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
  maxLength: number;
  objectTypeArray: Array<{
    type: string,
    count: number
  }>;
  constructor(
    private _collectionService: CollectionService,
    private _cookieUtilsService: CookieUtilsService,
    private _dialogsService: DialogsService,
    private matSnackBar: MatSnackBar) { }


  ngOnChanges() {
    this.calculateLearningData();
  }

  ngOnInit() {
    this.envVariable = environment;
    this.maxLength = 200;
  }

  private calculateLearningData() {
    this.totalHours = 0;
    console.log(this.learningPath);
    const collectionTypeMap = new Map<string, number>();
    this.objectTypeArray = [];
    this.learningPath.contents.forEach(content => {
      if (content.courses && content.courses.length > 0) {
        if (content.courses[0].type === 'guide') {
          const guideHours = this._collectionService.calculateDuration(content.courses[0].description.length);
          console.log('guideHours' + guideHours);
          this.totalHours += guideHours;
        }
        this.totalHours += content.courses[0].totalHours;
      }
      if (collectionTypeMap.has(content.courses[0].type)) {
        let currentIndex = collectionTypeMap.get(content.courses[0].type);
        currentIndex++;
        collectionTypeMap.set(content.courses[0].type, currentIndex);
      } else {
        collectionTypeMap.set(content.courses[0].type, 1);
      }
    });
    collectionTypeMap.forEach((val, key) => {
      this.objectTypeArray.push({
        type: this._collectionService.getCollectionContentType(key),
        count: val
      });
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
          this.matSnackBar.open('You need to signup or sign in to join this learning path', 'close', { duration: 3000 });
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
