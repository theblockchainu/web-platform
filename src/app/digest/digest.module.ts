import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WhyTeachComponent} from './why-teach/why-teach.component';
import {TeachingBenefitsComponent} from './teaching-benefits/teaching-benefits.component';
import {ResponsibleTeachingComponent} from './responsible-teaching/responsible-teaching.component';
import {DigestRoutingModule} from './digest-routing.module';
import { ExperienceIntroComponent } from './experience-intro/experience-intro.component';
import { WorkshopIntroComponent } from './workshop-intro/workshop-intro.component';
import { CommunityIntroComponent } from './community-intro/community-intro.component';
import { PeerIntroComponent } from './peer-intro/peer-intro.component';

@NgModule({
  imports: [
    CommonModule,
    DigestRoutingModule
  ],
  declarations: [WhyTeachComponent, TeachingBenefitsComponent, ResponsibleTeachingComponent, ExperienceIntroComponent, WorkshopIntroComponent, CommunityIntroComponent, PeerIntroComponent]
})
export class DigestModule { }
