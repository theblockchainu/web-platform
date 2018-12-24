import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
declare var fbq: any;

@Component({
  selector: 'app-learning-path-card',
  templateUrl: './learning-path-card.component.html',
  styleUrls: ['./learning-path-card.component.scss']
})
export class LearningPathCardComponent implements OnInit, OnChanges {
  envVariable: any;
  userId: string;

  @Input() learningPath: any;
  @Input() cardsPerRow = 2;
  @Output() refresh = new EventEmitter<any>();

  constructor(
    private _cookieUtilsService: CookieUtilsService,
    public _collectionService: CollectionService,
    public _dialogsService: DialogsService
  ) { }

  ngOnInit() {
    this.envVariable = environment;
    this.userId = this._cookieUtilsService.getValue('userId');
  }

  ngOnChanges() {
    if (!this.learningPath.totalHours) {
      this.calculateLearningHours();
    }
  }

  private calculateLearningHours() {
    let totalHours = 0;
    console.log(this.learningPath);
    this.learningPath.contents.forEach(content => {
      if (content.courses && content.courses.length > 0) {
        if (content.courses[0].type === 'guide') {
          const guideHours = this._collectionService.calculateDuration(content.courses[0].description.length);
          console.log('guideHours' + guideHours);
          totalHours += guideHours;
        } else {
          totalHours += content.courses[0].totalHours;
        }
      }
    });
    this.learningPath.totalHours = totalHours;
  }

}
