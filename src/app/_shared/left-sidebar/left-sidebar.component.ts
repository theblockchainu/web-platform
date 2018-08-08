import {
	Component, OnInit, Input, forwardRef, ElementRef, Inject, EventEmitter
	, HostBinding, HostListener, Output
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';

import { LeftSidebarService, SideBarMenuItem } from '../../_services/left-sidebar/left-sidebar.service';
import { CollectionService } from '../../_services/collection/collection.service';

import * as _ from 'lodash';

@Component({
	selector: 'app-left-sidebar',
	templateUrl: './left-sidebar.component.html',
	styleUrls: ['./left-sidebar.component.scss'],
	animations: [
		trigger('slideInOut', [
			state('in', style({
				transform: 'translate3d(0, 0, 0)'
			})),
			state('out', style({
				transform: 'translate3d(100%, 0, 0)'
			})),
			transition('in => out', animate('400ms ease-in-out')),
			transition('out => in', animate('400ms ease-in-out'))
		]),
	]
})

export class LeftSidebarComponent implements OnInit {

	menuState = 'out';
	public menuJSON: Observable<Array<any>>;
	public step: number;
	public id: string;
	public path: string;
	public status = 'draft';
	public collection: any;

	public sidebarMenuItems;

	// Input Parameter
	@Input()
	private menuFile;

	@Output()
	private menuArray = new EventEmitter<any>();

	constructor(
		public router: Router,
		private _leftSidebarService: LeftSidebarService,
		private activatedRoute: ActivatedRoute,
		public _collectionService: CollectionService) {
	}

	ngOnInit() {
		this._leftSidebarService.getMenuItems(this.menuFile).subscribe(response => {
			this.sidebarMenuItems = response;
			this.menuArray.emit(this.sidebarMenuItems);
		});
		this.path = this.router.url.split('/')[1];
		this.activatedRoute.params.subscribe(params => {
			this.id = params['collectionId']; // Need to make it generic or fetch different names like experienceId and put ||
			this.step = params['step'];
		});
		if (this.id) {
			const query = {
				'include': [
					'topics',
					'calendars',
					{ 'participants': [{ 'profiles': ['work'] }] },
					{ 'owners': ['profiles'] },
					{ 'contents': ['schedules'] },
					{ 'assessment_models': ['assessment_na_rules', 'assessment_rules'] }
				]
			};
			this._collectionService.getCollectionDetail(this.id, query)
				.subscribe((res: any) => {
					this.status = res.status;
					this.collection = res;
					if (this.sidebarMenuItems) {
						this.sidebarMenuItems = this._leftSidebarService.updateSideMenu(this.collection, this.sidebarMenuItems);
					} else {
						this._leftSidebarService.getMenuItems(this.menuFile).subscribe(response => {
							this.sidebarMenuItems = this._leftSidebarService.updateSideMenu(this.collection, response);
						});
					}
					this.menuArray.emit(this.sidebarMenuItems);
				},
					err => console.log('error'),
					() => console.log('Completed!'));
		} else {
			console.log('NO COLLECTION');
		}
	}

	public toggleMenu() {
		this.menuState = this.menuState === 'out' ? 'in' : 'out';
	}

	public goto(item) {
		let step = item.step;
		const isLocked = item.locked;
		if (!isLocked) {
			if (_.includes(step, '_')) {
				step = _.take(step.split('_'))[0];
			}
			this.step = +step;
			this.router.navigate([this.path, this.id, 'edit', step]);
		}
	}

}
