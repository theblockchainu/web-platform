import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import {environment} from '../../../environments/environment';

@Component({
	selector: 'app-topic-row',
	templateUrl: './topic-row.component.html',
	styleUrls: ['./topic-row.component.scss']
})
export class TopicRowComponent implements OnInit {
	public translateX: number;
	public transformStyle: any;
	public envVariable;
	@Input() availableTopics: Array<any>;
	@Output() topciClickedEvent = new EventEmitter<number>();
	
	constructor(
		public _collectionService: CollectionService
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		this.translateX = 0;
		this.transformStyle = {
			'transform': 'translateX(0%)'
		};
	}
	
	public translate(increment: boolean) {
		if (increment && this.translateX < 0) {
			this.translateX += 26;
		} else if (!increment) {
			const el = document.getElementById('topic' + (this.availableTopics.length - 1));
			if (el.getClientRects()[0].left > 1500) {
				this.translateX -= 26;
			}
		}
		this.transformStyle = {
			'transform': 'translateX(' + this.translateX + '%)'
		};
	}
	
	public topicClicked(topicIndex: number) {
		this.topciClickedEvent.emit(topicIndex);
	}
	
}
