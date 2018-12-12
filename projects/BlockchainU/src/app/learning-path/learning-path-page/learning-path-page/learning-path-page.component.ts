import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';

import { ActivatedRoute } from '@angular/router';
import { first, flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
	selector: 'app-learning-path-page',
	templateUrl: './learning-path-page.component.html',
	styleUrls: ['./learning-path-page.component.scss']
})
export class LearningPathPageComponent implements OnInit {
	
	public learningPath: any;
	public learningPathId: string;
	public learningPathUrl: string;
	private toOpenDialogName: string;
	private previewAs: boolean;
	envVariable: any;
	joined: boolean;
	
	constructor(
		public _collectionService: CollectionService,
		private activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService
	) { }
	
	ngOnInit() {
		this.setup();
	}
	
	setup() {
		this.initialiseVariables();
		this.fetchPathParams()
			.pipe(
				flatMap(res => {
					return this.fetchData();
				}),
				flatMap(res => {
					return this.processData(res);
				})
			)
			.subscribe(res => {
				console.log('Page Data Loaded');
			});
	}
	
	
	fetchData() {
		const query = {
			'where': {
				'or': [{'customUrl': this.learningPathUrl}, {'id': this.learningPathUrl}]
			},
			'include': [
				'topics',
				{ 'participants': [{ 'profiles': ['work'] }] },
				{ 'owners': ['profiles', 'topicsTeaching'] },
				{
					'relation': 'contents',
					'scope': {
						'include': [{ 'courses': [{ 'owners': ['profiles'] }] }],
						'order': 'contentIndex ASC'
					}
				},
			]
			
		};
		return this._collectionService.getAllCollections(query);
	}
	
	private initialiseVariables() {
		this.envVariable = environment;
		this.joined = false;
	}
	
	private fetchPathParams() {
		return this.activatedRoute.params.pipe(
			first(),
			flatMap(params => {
				this.learningPathUrl = params['collectionCustomUrl'];
				this.toOpenDialogName = params['dialogName'];
				return this.activatedRoute.queryParams;
			}),
			flatMap(params => {
				if (params['previewAs']) {
					this.previewAs = params['previewAs'];
					console.log('Previewing as ' + this.previewAs);
				}
				if (params['referredBy']) {
					this._collectionService.saveRefferedBY(params['referredBy']);
				}
				return new Observable(obs => {
					obs.next();
				});
			}));
	}
	
	private processData(data: any) {
		this.learningPath = data[0];
		const userId = this._cookieUtilsService.getValue('userId');
		if (this.learningPath && this.learningPath.participants) {
			this.learningPath.participants.some((participant: any) => {
				if (participant.id === userId) {
					this.joined = true;
					console.log('joined');
					return true;
				}
			});
		} else {
			this.joined = false;
		}
		return new Observable(obs => {
			obs.next();
		});
	}
	
}
