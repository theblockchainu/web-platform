import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
declare var fbq: any;
import * as moment from 'moment';

@Component({
	selector: 'app-bounty-card',
	templateUrl: './bounty-card.component.html',
	styleUrls: ['./bounty-card.component.scss']
})
export class BountyCardComponent implements OnInit, OnChanges {

	public envVariable;
	public userId;

	@Input() bounty: any;
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

	ngOnChanges() {
		let highestReward: any;
		if (this.bounty.rewards && this.bounty.rewards.length > 0) {
			for (let index = 0; index < this.bounty.rewards.length; index++) {
				const reward = this.bounty.rewards[index];
				if (reward.position === 1) {
					highestReward = reward;
					break;
				}
			}
			this.bounty.highestReward = highestReward;
		}
		if (this.bounty) {
			this.getTime();
		}
	}

	public getTime() {
		const startMoment = moment(this.bounty.calendars[0].startDate);
		const endMoment = moment(this.bounty.calendars[0].endDate);
		this.bounty.startsIn = moment().to(startMoment);
		this.bounty.startDiff = startMoment.diff(moment());
		this.bounty.endsIn = moment().to(endMoment);
	}

	public toggleBountyBookmark(bounty) {

		if (this.userId) {
			if (!(bounty.bookmarks && bounty.bookmarks[0]
				&& bounty.bookmarks[0].peer && bounty.bookmarks[0].peer[0]
				&& bounty.bookmarks[0].peer[0].id === this.userId)) {
				this._collectionService.saveBookmark(bounty.id, (err, response) => {
					// FB Event Trigger
					try {
						if (fbq && fbq !== undefined) {
							fbq('track', 'AddToWishlist', {
								currency: 'USD',
								value: 0.0,
								content_ids: [bounty.id],
								content_name: bounty.title,
								content_category: bounty.type,
								content_type: 'product'
							});
						}
					} catch (e) {
						console.log(e);
					}
					this.refresh.emit(true);
				});
			} else {
				this._collectionService.removeBookmark(bounty.bookmarks[0].id, (err, response) => {
					this.refresh.emit(true);
				});
			}
		} else {
			this._dialogsService.openLogin();
		}


	}

	public onMouseEnter(bounty) {
		bounty.cardInFocus = false;
	}

	public onMouseLeave(bounty) {
		bounty.cardInFocus = false;
	}

	public getPredictedGyanEarn(collection) {
		const participantCount = collection.participants ? collection.participants.length : 0;
		return (collection.academicGyan + collection.nonAcademicGyan) * participantCount;
	}
}
