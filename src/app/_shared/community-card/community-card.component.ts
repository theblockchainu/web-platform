import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CookieUtilsService} from '../../_services/cookieUtils/cookie-utils.service';
import {DialogsService} from '../../_services/dialogs/dialog.service';
import {environment} from '../../../environments/environment';
import {CommunityService} from '../../_services/community/community.service';

@Component({
	selector: 'app-community-card',
	templateUrl: './community-card.component.html',
	styleUrls: ['./community-card.component.scss']
})
export class CommunityCardComponent implements OnInit {
	
	public envVariable;
	public userId;
	
	@Input() community: any;
	@Output() refresh = new EventEmitter<any>();
	
	constructor(
		private _cookieUtilsService: CookieUtilsService,
		public _communityService: CommunityService,
		public _dialogsService: DialogsService
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
	}
	
	public toggleCommunityBookmark(community) {
		if (!(community.bookmarks
			&& community.bookmarks[0] && community.bookmarks[0].peer
			&& community.bookmarks[0].peer[0] && community.bookmarks[0].peer[0].id === this.userId)) {
			this._communityService.saveBookmark(community.id, (err, response) => {
				this.refresh.emit(true);
			});
		} else {
			this._communityService.removeBookmark(community.bookmarks[0].id, (err, response) => {
				this.refresh.emit(true);
			});
		}
	}
	
}
