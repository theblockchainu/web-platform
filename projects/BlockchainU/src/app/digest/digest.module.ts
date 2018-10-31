import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhyTeachComponent } from './why-teach/why-teach.component';
import { TeachingBenefitsComponent } from './teaching-benefits/teaching-benefits.component';
import { ResponsibleTeachingComponent } from './responsible-teaching/responsible-teaching.component';
import { DigestRoutingModule } from './digest-routing.module';
import { ExperienceIntroComponent } from './experience-intro/experience-intro.component';
import { ClassIntroComponent } from './class-intro/class-intro.component';
import { CommunityIntroComponent } from './community-intro/community-intro.component';
import { PeerIntroComponent } from './peer-intro/peer-intro.component';
import { MatMenuModule, MatButtonModule } from '@angular/material';
import { AboutUsComponent } from './about-us/about-us.component';
@NgModule({
  imports: [
    CommonModule,
    DigestRoutingModule,
    MatMenuModule,
    MatButtonModule
  ],
  declarations: [WhyTeachComponent,
    TeachingBenefitsComponent, ResponsibleTeachingComponent,
    ExperienceIntroComponent, ClassIntroComponent, CommunityIntroComponent,
    PeerIntroComponent, AboutUsComponent]
})
export class DigestModule { }
