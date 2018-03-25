import { NgModule } from '@angular/core';
import { CommonModule, NgSwitch, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatChipsModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatTabsModule,
    MatTableModule,
    MatInputModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSelectModule,
    MatDatepickerModule,
    MatGridListModule,
    MatRadioModule,
    MatNativeDateModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatTooltipModule
} from '@angular/material';
import {
    ModalModule, BsDropdownModule, ProgressbarModule,
    TabsModule, PopoverModule, DatepickerModule, TimepickerModule
} from 'ngx-bootstrap';
import {
    FileUploadModule, ScheduleModule, DialogModule,
    CheckboxModule, LightboxModule, RatingModule,
    AccordionModule, SliderModule
} from 'primeng/primeng';
import { NgPipesModule } from 'ngx-pipes';
import { CalendarModule } from 'angular-calendar';
import { NguCarouselModule } from '@ngu/carousel';
import { MultiselectAutocompleteModule } from './multiselect-autocomplete/multiselect-autocomplete.module';
import { GenericMultiselectAutocompleteComponentModule } from './generic-multiselect-autocomplete/generic-multiselect-autocomplete.module';
import { SocialSyncModule } from './socialsync/socialsync.module';
import { LeftSidebarModule } from './left-sidebar/left-sidebar.module';
import { CollectionService } from '../_services/collection/collection.service';
import { CountryPickerService } from '../_services/countrypicker/countrypicker.service';
import { LanguagePickerService } from '../_services/languagepicker/languagepicker.service';
import { AppointmentService } from '../_services/appointment/appointment.service';
import { RequestHeaderService } from '../_services/requestHeader/request-header.service';
import { MediaUploaderService } from '../_services/mediaUploader/media-uploader.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { ContentService } from '../_services/content/content.service';
import { LeftSidebarService } from '../_services/left-sidebar/left-sidebar.service';
import { CurrencyPickerService } from '../_services/currencypicker/currencypicker.service';
import { TopicService } from '../_services/topic/topic.service';
import { CommentService } from '../_services/comment/comment.service';
import { NotificationService } from '../_services/notification/notification.service';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';
import { ExtractTimePipe } from './extract-time/extract-time.pipe';
import { SocketService } from '../_services/socket/socket.service';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { StickyModule } from 'ng2-sticky-kit';
import { ConvertCurrencyPipe } from './convert-currency/convert-currency.pipe';
import { TrimPipe } from './trim/trim.pipe';
import { ProfilePopupComponent } from './profile-popup/profile-popup.component';
import { TextIconCarouselComponent } from './text-icon-carousel/text-icon-carousel.component';
import { Ng4GeoautocompleteModule } from 'ng4-geoautocomplete';
import { AgmCoreModule } from '@agm/core';
import { QuestionService } from '../_services/question/question.service';
import { CommunityService } from '../_services/community/community.service';
import { InboxService } from '../_services/inbox/inbox.service';
import { SearchService } from '../_services/search/search.service';
import { TimeToNowPipe } from './timetonow/time-to-now.pipe';
import { TopicRowComponent } from './topic-row/topic-row.component';

@NgModule({
    imports: [
        ProgressbarModule.forRoot(),
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        BsDropdownModule.forRoot(),
        FileUploadModule,
        CommonModule,
        PopoverModule.forRoot(),
        CalendarModule.forRoot(),
        LoadingModule.forRoot({
            animationType: ANIMATION_TYPES.threeBounce,
            backdropBackgroundColour: 'rgba(0,0,0,0)',
            backdropBorderRadius: '0px',
            primaryColour: '#33bd9e',
            secondaryColour: '#ff5b5f',
            tertiaryColour: '#ff6d71'
        }),
        // DeviceDetectorModule.forRoot(),
        StickyModule,
        NguCarouselModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyCCXlBKSUs2yVH1dUogUgb0Ku2VmmR61Ww',
            libraries: ['places'],
            language: 'en-US'
        }),
        Ng4GeoautocompleteModule.forRoot(),
        MatIconModule,
        MatButtonModule
    ],
    declarations:
        [ExtractTimePipe,
            ConvertCurrencyPipe, ProfilePopupComponent,
            TrimPipe, TextIconCarouselComponent, TimeToNowPipe, TopicRowComponent
        ],
    providers: [
        CollectionService,
        CountryPickerService,
        LanguagePickerService,
        AppointmentService,
        RequestHeaderService,
        MediaUploaderService,
        CookieUtilsService,
        ContentService,
        LeftSidebarService,
        CurrencyPickerService,
        CommentService,
        TopicService,
        NotificationService,
        SocketService,
        ExtractTimePipe,
        ConvertCurrencyPipe,
        CurrencyPipe,
        InboxService,
        TitleCasePipe,
        QuestionService,
        CommunityService,
        SearchService,
        TimeToNowPipe
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ProgressbarModule,
        ModalModule,
        RatingModule,
        TabsModule,
        BsDropdownModule,
        FileUploadModule,
        ScheduleModule,
        DialogModule,
        CalendarModule,
        CheckboxModule,
        MultiselectAutocompleteModule,
        GenericMultiselectAutocompleteComponentModule,
        SocialSyncModule,
        PopoverModule,
        LightboxModule,
        LeftSidebarModule,
        DatepickerModule,
        TimepickerModule,
        NgPipesModule,
        AccordionModule,
        MatChipsModule, MatDialogModule, MatMenuModule, MatButtonModule,
        MatCardModule, MatToolbarModule, MatIconModule, MatProgressBarModule,
        MatListModule, MatTabsModule, MatTableModule, MatInputModule, MatCheckboxModule,
        MatSidenavModule, MatSelectModule, MatDatepickerModule, MatGridListModule, MatRadioModule,
        MatNativeDateModule, MatSliderModule, MatAutocompleteModule,
        SliderModule, MatProgressSpinnerModule, MatExpansionModule, MatSnackBarModule, ExtractTimePipe,
        LoadingModule, MatTooltipModule, ConvertCurrencyPipe, ProfilePopupComponent, TrimPipe, TitleCasePipe
        , TextIconCarouselComponent, Ng4GeoautocompleteModule, AgmCoreModule, TimeToNowPipe, TopicRowComponent,
        NguCarouselModule
    ]
})
export class SharedModule {
}
