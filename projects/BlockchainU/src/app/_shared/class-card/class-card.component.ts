import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
declare var fbq: any;
import * as moment from 'moment';

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
		this.getTime();
	}

	public getTime() {
		if (this._collectionService.getCurrentCalendar(this.class.calendars)) {
			const startMoment = moment(this._collectionService.getCurrentCalendar(this.class.calendars).startDate);
			const endMoment = moment(this._collectionService.getCurrentCalendar(this.class.calendars).endDate);
			this.class.startsIn = moment().to(startMoment);
			this.class.startDiff = startMoment.diff(moment());
			this.class.endsIn = moment().to(endMoment);
			this.class.endDiff = endMoment.diff(moment());
		} else {
			this.class.startsIn = '';
			this.class.startDiff = '';
			this.class.endDiff = '';
			this.class.endsIn = '';
		}
	}

	public toggleClassBookmark(_class) {
		if (this.userId) {
			if (!(_class.bookmarks && _class.bookmarks[0]
				&& _class.bookmarks[0].peer && _class.bookmarks[0].peer[0]
				&& _class.bookmarks[0].peer[0].id === this.userId)) {
				this._collectionService.saveBookmark(_class.id, (err, response) => {
					// FB Event Trigger
					try {
						if (fbq && fbq !== undefined) {
							fbq('track', 'AddToWishlist', {
								currency: 'USD',
								value: 0.0,
								content_ids: [_class.id],
								content_name: _class.title,
								content_category: _class.type,
								content_type: 'product'
							});
						}
					} catch (e) {
						console.log(e);
					}
					this.refresh.emit(true);
				});
			} else {
				this._collectionService.removeBookmark(_class.bookmarks[0].id, (err, response) => {
					this.refresh.emit(true);
				});
			}
		} else {
			this._dialogsService.openLogin();
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
