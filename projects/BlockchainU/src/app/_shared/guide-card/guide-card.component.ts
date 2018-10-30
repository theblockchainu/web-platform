import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
declare var fbq: any;

@Component({
	selector: 'app-guide-card',
	templateUrl: './guide-card.component.html',
	styleUrls: ['./guide-card.component.scss']
})
export class GuideCardComponent implements OnInit {
	
	public envVariable;
	public userId;
	
	@Input() guide: any;
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
		console.log(this.guide);
	}
	
	public toggleGuideBookmark(guide) {
		if (this.userId) {
			if (!(guide.bookmarks && guide.bookmarks[0]
				&& guide.bookmarks[0].peer && guide.bookmarks[0].peer[0]
				&& guide.bookmarks[0].peer[0].id === this.userId)) {
				this._collectionService.saveBookmark(guide.id, (err, response) => {
					// FB Event Trigger
					try {
						if (fbq && fbq !== undefined) {
							fbq('track', 'AddToWishlist', {
								currency: 'USD',
								value: 0.0,
								content_ids: [guide.id],
								content_name: guide.title,
								content_category: guide.type,
								content_type: 'product'
							});
						}
					} catch (e) {
						console.log(e);
					}
					this.refresh.emit(true);
				});
			} else {
				this._collectionService.removeBookmark(guide.bookmarks[0].id, (err, response) => {
					this.refresh.emit(true);
				});
			}
		} else {
			this._dialogsService.openLogin();
		}
		
		
	}
	
	public onMouseEnter(guide) {
		guide.cardInFocus = false;
	}
	
	public onMouseLeave(guide) {
		guide.cardInFocus = false;
	}
	
	public getPredictedGyanEarn(collection) {
		const participantCount = collection.participants ? collection.participants.length : 0;
		return (collection.academicGyan + collection.nonAcademicGyan) * participantCount;
	}
}
