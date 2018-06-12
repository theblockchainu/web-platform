import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CollectionService} from '../../_services/collection/collection.service';
import {CookieUtilsService} from '../../_services/cookieUtils/cookie-utils.service';
import {DialogsService} from '../../_services/dialogs/dialog.service';
import {environment} from '../../../environments/environment';

@Component({
	selector: 'app-peer-card',
	templateUrl: './peer-card.component.html',
	styleUrls: ['./peer-card.component.scss']
})
export class PeerCardComponent implements OnInit {
	
	public envVariable;
	public userId;
	
	@Input() peer: any;
	@Input() cardsPerRow = 6;
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
	
}
