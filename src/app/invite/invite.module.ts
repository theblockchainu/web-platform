import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InviteRoutingModule } from './invite-routing.module';
import { InviteComponent } from './invite.component';
import { SharedModule } from '../_shared/_shared.module';
import { SocialSharingService } from '../_services/social-sharing/social-sharing.service';
@NgModule({
  imports: [
    CommonModule,
    InviteRoutingModule,
    SharedModule
  ],
  providers: [
    SocialSharingService
  ],
  declarations: [
    InviteComponent
  ]
})
export class InviteModule { }
