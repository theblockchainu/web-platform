import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../_shared/_shared.module';
import { GuidePageRoutingModule } from './guide-page-routing.module';
import { GuidePageComponent } from './guide-page.component';
import { ProjectSubmissionService } from '../../_services/project-submission/project-submission.service';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';
import { CovalentMarkdownModule } from '@covalent/markdown';
import { CorestackService } from '../../_services/corestack/corestack.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CodeLabsComponent } from './code-labs/code-labs.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BlockchainKeysComponent } from './code-labs/blockchain-keys/blockchain-keys.component';
import { MatDialogRef } from '@angular/material';
import { ClipboardModule } from 'ngx-clipboard';

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
		CovalentMarkdownModule,
		MatButtonToggleModule,
		MatBottomSheetModule,
		ClipboardModule
	],
	declarations: [
		GuidePageComponent,
		CodeLabsComponent,
		BlockchainKeysComponent,
	],
	providers: [ProjectSubmissionService, CorestackService, { provide: MatDialogRef, useValue: {} }],
	entryComponents: [BlockchainKeysComponent]

})
export class GuidePageModule { }
