import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/_shared.module';
import { ProfileComponent } from './profile.component';

import { ProfileRoutingModule } from './profile-routing.module';
import { MatTabsModule } from '@angular/material';
import { SeeDatesWorkshopComponent } from './see-dates-workshop/see-dates-workshop.component';
import { ExtractLanguagePipe } from '../_shared/extract-language/extract-language.pipe';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProfileRoutingModule,
    MatTabsModule
  ],
  declarations: [ProfileComponent, SeeDatesWorkshopComponent, ExtractLanguagePipe],
})
export class ProfileModule { }
