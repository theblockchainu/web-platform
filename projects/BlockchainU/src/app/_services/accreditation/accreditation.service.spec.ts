import { TestBed, inject } from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { AccreditationService } from './accreditation.service';
import {UploadFileModule} from '../../_shared/upload-file/upload-file.module';
import {MatButtonModule, MatButtonToggleModule, MatCardModule, MatChipsModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatProgressBarModule, MatRadioModule, MatSelectModule, MatSlideToggleModule, MatTableModule, MatTooltipModule} from '@angular/material';
import {PeerCardModule} from '../../_shared/peer-card/peer-card.module';
import {NguCarouselModule} from '@ngu/carousel';
import {ActivatedRoute, Data, Router, RouterModule} from '@angular/router';
import {MatVideoModule} from 'mat-video';
import {ANIMATION_TYPES, LoadingModule} from 'ngx-loading';
import {NgPipesModule} from 'ngx-pipes';
import {ProfilePopupModule} from '../../_shared/profile-popup/profile-popup.module';
import {ColorPickerModule, FileUploadModule, RatingModule} from 'primeng/primeng';
import {AgmCoreModule} from '@agm/core';
import {CommonModule} from '@angular/common';
import {SafePipeModule} from '../../_shared/safe-pipe/safe-pipe.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxGeoautocompleteModule} from 'ngx-geoautocomplete';
import {CalendarModule} from 'angular-calendar';
import {ShareModule} from '@ngx-share/core';
import {GyanBalanceModule} from '../../_shared/gyan-balance/gyan-balance.module';
import {AuthenticationService} from '../authentication/authentication.service';
import {RequestHeaderService} from '../requestHeader/request-header.service';
import {CookieUtilsService} from '../cookieUtils/cookie-utils.service';
import {CookieService} from 'ngx-cookie-service';
import {SocketService} from '../socket/socket.service';
import {InboxService} from '../inbox/inbox.service';

describe('AccreditationService', () => {
	let httpClient: HttpClient;
	let httpTestingController: HttpTestingController;
	let cookieUtilsService: CookieUtilsService;
	let authenticationService: AuthenticationService;
	let socketService: SocketService;
	const cookieService = {};
	const inboxService = {};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				CommonModule,
				FileUploadModule,
				ProfilePopupModule,
				CalendarModule.forRoot(),
				FormsModule,
				RatingModule,
				LoadingModule.forRoot({
					animationType: ANIMATION_TYPES.threeBounce,
					backdropBackgroundColour: 'rgba(0,0,0,0)',
					backdropBorderRadius: '0px',
					primaryColour: '#33bd9e',
					secondaryColour: '#ff5b5f',
					tertiaryColour: '#ff6d71'
				}),
				NguCarouselModule,
				AgmCoreModule.forRoot({
					apiKey: 'AIzaSyCCXlBKSUs2yVH1dUogUgb0Ku2VmmR61Ww',
					libraries: ['places'],
					language: 'en-US'
				}),
				NgxGeoautocompleteModule.forRoot(),
				MatIconModule,
				MatButtonModule,
				MatTooltipModule,
				ShareModule.forRoot(),
				RouterModule,
				NgPipesModule,
				ReactiveFormsModule,
				MatFormFieldModule,
				ColorPickerModule,
				MatInputModule,
				MatSelectModule,
				MatButtonToggleModule,
				MatSlideToggleModule,
				MatCardModule,
				MatChipsModule,
				MatMenuModule,
				MatDatepickerModule,
				MatProgressBarModule,
				UploadFileModule,
				ProfilePopupModule,
				GyanBalanceModule,
				PeerCardModule,
				SafePipeModule,
				MatTableModule,
				MatRadioModule,
				MatVideoModule,
				HttpClientTestingModule
			],
			providers: [
				AccreditationService,
				AuthenticationService,
				RequestHeaderService,
				cookieUtilsService,
				socketService,
				{
					provide: ActivatedRoute,
					useValue: {
						data: {
							subscribe: (fn: (value: Data) => void) => fn({
								yourData: 'yolo'
							})
						}
					}
				},
				{
					provide: Router,
					useValue: {
						data: {
							subscribe: (fn: (value: Data) => void) => fn({
								yourData: 'yolo'
							})
						}
					}
				}
			]
		});
		// Inject the http service and test controller for each test
		httpClient = TestBed.get(HttpClient);
		httpTestingController = TestBed.get(HttpTestingController);
		cookieUtilsService = new CookieUtilsService(cookieService as CookieService, '');
		socketService = new SocketService(cookieUtilsService, inboxService as InboxService);
		/*authenticationService = new AuthenticationService(httpClient, cookieUtilsService, route, router, requestHeaderService, socketService);*/
	});

	it('should be created', inject([AccreditationService], (service: AccreditationService) => {
		expect(service).toBeTruthy();
	}));
});
