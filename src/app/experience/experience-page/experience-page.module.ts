import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../_shared/_shared.module';
import { ViewParticipantsComponent } from './view-participants/view-participants.component';
import { ContentVideoComponent } from './content-video/content-video.component';
import { ContentProjectComponent } from './content-project/content-project.component';
import { MessageParticipantComponent } from './message-participant/message-participant.component';
import { ShowRSVPPopupComponent } from './show-rsvp-participants-dialog/show-rsvp-dialog.component';
import { ExperiencePageRoutingModule } from './experience-page-routing.module';
import { ExperiencePageComponent } from './experience-page.component';
import { ProjectSubmissionService } from '../../_services/project-submission/project-submission.service';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { StickyModule } from 'ng2-sticky-kit';
import { ContentInpersonComponent } from './content-inperson/content-inperson.component';

@NgModule({
  imports: [
    ExperiencePageRoutingModule,
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
    StickyModule
  ],

  declarations: [ExperiencePageComponent, ViewParticipantsComponent, ContentVideoComponent, ContentProjectComponent, ContentInpersonComponent, MessageParticipantComponent, ShowRSVPPopupComponent],
  bootstrap: [ViewParticipantsComponent, ContentVideoComponent, ContentProjectComponent, ContentInpersonComponent, MessageParticipantComponent, ShowRSVPPopupComponent],
  providers: [ProjectSubmissionService]

})
export class ExperiencePageModule { }
