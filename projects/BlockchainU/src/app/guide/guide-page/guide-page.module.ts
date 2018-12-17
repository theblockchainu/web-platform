import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../_shared/_shared.module';
import { ContentVideoComponent } from './content-video/content-video.component';
import { ContentProjectComponent } from './content-project/content-project.component';
import { ShowRSVPPopupComponent } from './show-rsvp-participants-dialog/show-rsvp-dialog.component';
import { GuidePageRoutingModule } from './guide-page-routing.module';
import { GuidePageComponent } from './guide-page.component';
import { ProjectSubmissionService } from '../../_services/project-submission/project-submission.service';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { ContentInpersonComponent } from './content-inperson/content-inperson.component';
import { CovalentMarkdownModule } from '@covalent/markdown';
import { CorestackService } from '../../_services/corestack/corestack.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CodeLabsComponent } from './code-labs/code-labs.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BlockchainKeysComponent } from './code-labs/blockchain-keys/blockchain-keys.component';
import { MatDialogRef } from '@angular/material';
import { LabCredentialsComponent } from './code-labs/lab-credentials/lab-credentials.component';

@NgModule({
	imports: [
		GuidePageRoutingModule,
		CommonModule,
		SharedModule,
		LoadingModule.forRoot({
			animationType: ANIMATION_TYPES.threeBounce,
			backdropBackgroundColour: 'rgba(0,0,0,0)',
			backdropBorderRadius: '0px',
			primaryColour: '#33bd9e',
			secondaryColour: '#ff5b5f',
			tertiaryColour: '#ff6d71'
		}),
		VgCoreModule,
		VgControlsModule,
		VgOverlayPlayModule,
		VgBufferingModule,
		CovalentMarkdownModule,
		MatButtonToggleModule,
		MatBottomSheetModule
	],
	declarations: [GuidePageComponent, ContentVideoComponent, ContentProjectComponent, ContentInpersonComponent,
		ShowRSVPPopupComponent,
		CodeLabsComponent,
		BlockchainKeysComponent,
		LabCredentialsComponent,
	],
	bootstrap: [ContentVideoComponent, ContentProjectComponent, ContentInpersonComponent, ShowRSVPPopupComponent],
	providers: [ProjectSubmissionService, CorestackService, { provide: MatDialogRef, useValue: {} }],
	entryComponents: [BlockchainKeysComponent, LabCredentialsComponent]

})
export class GuidePageModule { }
