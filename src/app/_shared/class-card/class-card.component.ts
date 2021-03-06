import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CollectionService} from '../../_services/collection/collection.service';
import {CookieUtilsService} from '../../_services/cookieUtils/cookie-utils.service';
import {DialogsService} from '../../_services/dialogs/dialog.service';
import {environment} from '../../../environments/environment';

@Component({
	selector: 'app-class-card',
	templateUrl: './class-card.component.html',
	styleUrls: ['./class-card.component.scss']
})
export class ClassCardComponent implements OnInit {
	
	public envVariable;
	public userId;
	
	@Input() class: any;
	@Input() cardsPerRow = 5;
	@Output() refresh = new EventEmitter<any>();
	
	constructor(
		private _cookieUtilsService: CookieUtilsService,
		public _collectionService: CollectionService,
		public _dialogsService: DialogsService
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
	}
	
	public toggleClassBookmark(_class) {
		if (!(_class.bookmarks && _class.bookmarks[0]
			&& _class.bookmarks[0].peer && _class.bookmarks[0].peer[0]
			&& _class.bookmarks[0].peer[0].id === this.userId)) {
			this._collectionService.saveBookmark(_class.id, (err, response) => {
				this.refresh.emit(true);
			});
		} else {
			this._collectionService.removeBookmark(_class.bookmarks[0].id, (err, response) => {
				this.refresh.emit(true);
			});
		}
	}
	
	public onMouseEnter(_class) {
		_class.cardInFocus = true;
	}
	
	public onMouseLeave(_class) {
		_class.cardInFocus = false;
	}
	
	public getPredictedGyanEarn(collection) {
		const participantCount = collection.participants ? collection.participants.length : 0;
		return (collection.academicGyan + collection.nonAcademicGyan) * participantCount;
	}
	
}
