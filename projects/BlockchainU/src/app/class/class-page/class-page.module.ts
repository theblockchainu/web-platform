import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../_shared/_shared.module';
import { ClassPageRoutingModule } from './class-page-routing.module';
import { ClassPageComponent } from './class-page.component';
import { ProjectSubmissionService } from '../../_services/project-submission/project-submission.service';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';
import { CovalentMarkdownModule } from '@covalent/markdown';

@NgModule({
	imports: [
		ClassPageRoutingModule,
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
		CovalentMarkdownModule
	],
	declarations: [ClassPageComponent],
	providers: [ProjectSubmissionService]

})
export class ClassPageModule { }
