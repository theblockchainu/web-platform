import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class LearningPathCardComponent implements OnInit {
  public envVariable;
  public userId;

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

}
