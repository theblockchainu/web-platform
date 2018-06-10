import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { WorkshopsComponent } from './workshops/workshops.component';
import { ExperiencesComponent } from './experiences/experiences.component';
import { PeersComponent } from './peers/peers.component';

import { MatTabsModule } from '@angular/material';
import { HomefeedComponent } from './homefeed/homefeed.component';
import { SharedModule } from '../_shared/_shared.module';
import { SelectTopicsComponent } from './dialogs/select-topics/select-topics.component';
import { SelectPriceComponent } from './dialogs/select-price/select-price.component';
import { StickyModule } from 'ng2-sticky-kit';
import { CommunitiesComponent } from './communities/communities.component';
import { SelectDurationComponentComponent } from './dialogs/select-duration-component/select-duration-component.component';

@NgModule({
	imports: [
		CommonModule,
		HomeRoutingModule,
		MatTabsModule,
		SharedModule,
		StickyModule
	],
	declarations: [
		HomeComponent,
		WorkshopsComponent,
		ExperiencesComponent,
		PeersComponent,
		HomefeedComponent,
		SelectTopicsComponent,
		SelectPriceComponent,
		CommunitiesComponent,
		SelectDurationComponentComponent
	],
	providers: [],
	bootstrap: [SelectTopicsComponent, SelectPriceComponent, SelectDurationComponentComponent]
})
export class HomeModule { }
