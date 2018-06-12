import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {environment} from '../../../environments/environment';
import {CookieUtilsService} from '../../_services/cookieUtils/cookie-utils.service';
import {CollectionService} from '../../_services/collection/collection.service';
import {DialogsService} from '../../_services/dialogs/dialog.service';

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
	}
	
	public toggleExperienceBookmark(experience) {
		if (!(experience.bookmarks && experience.bookmarks[0]
			&& experience.bookmarks[0].peer && experience.bookmarks[0].peer[0]
			&& experience.bookmarks[0].peer[0].id === this.userId)) {
			this._collectionService.saveBookmark(experience.id, (err, response) => {
				this.refresh.emit(true);
			});
		} else {
			this._collectionService.removeBookmark(experience.bookmarks[0].id, (err, response) => {
				this.refresh.emit(true);
			});
		}
	}
	
	public onMouseEnter(experience) {
		experience.cardInFocus = true;
	}
	
	public onMouseLeave(experience) {
		experience.cardInFocus = false;
	}
	
	public getPredictedGyanEarn(collection) {
		const participantCount = collection.participants ? collection.participants.length : 0;
		return (collection.academicGyan + collection.nonAcademicGyan) * participantCount;
	}
}
