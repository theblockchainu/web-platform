import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
declare var fbq: any;
import * as moment from 'moment';

@Component({
	selector: 'app-experience-card',
	templateUrl: './experience-card.component.html',
	styleUrls: ['./experience-card.component.scss']
})
export class ExperienceCardComponent implements OnInit {

	public envVariable;
	public userId;

	@Input() experience: any;
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
		const startMoment = moment(this._collectionService.getCurrentCalendar(this.experience.calendars).startDate);
		const endMoment = moment(this._collectionService.getCurrentCalendar(this.experience.calendars).endDate);
		this.experience.startsIn = moment().to(startMoment);
		this.experience.startDiff = startMoment.diff(moment());
		this.experience.endsIn = moment().to(endMoment);
	}

	public toggleExperienceBookmark(experience) {

		if (this.userId) {
			if (!(experience.bookmarks && experience.bookmarks[0]
				&& experience.bookmarks[0].peer && experience.bookmarks[0].peer[0]
				&& experience.bookmarks[0].peer[0].id === this.userId)) {
				this._collectionService.saveBookmark(experience.id, (err, response) => {
					// FB Event Trigger
					try {
						if (fbq && fbq !== undefined) {
							fbq('track', 'AddToWishlist', {
								currency: 'USD',
								value: 0.0,
								content_ids: [experience.id],
								content_name: experience.title,
								content_category: experience.type,
								content_type: 'product'
							});
						}
					} catch (e) {
						console.log(e);
					}
					this.refresh.emit(true);
				});
			} else {
				this._collectionService.removeBookmark(experience.bookmarks[0].id, (err, response) => {
					this.refresh.emit(true);
				});
			}
		} else {
			this._dialogsService.openLogin();
		}


	}

	public onMouseEnter(experience) {
		experience.cardInFocus = false;
	}

	public onMouseLeave(experience) {
		experience.cardInFocus = false;
	}

	public getPredictedGyanEarn(collection) {
		const participantCount = collection.participants ? collection.participants.length : 0;
		return (collection.academicGyan + collection.nonAcademicGyan) * participantCount;
	}
}
