import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ClassesComponent } from './classes/classes.component';
import { ExperiencesComponent } from './experiences/experiences.component';
import { PeersComponent } from './peers/peers.component';

import { MatTabsModule } from '@angular/material';
import { HomefeedComponent } from './homefeed/homefeed.component';
import { SharedModule } from '../_shared/_shared.module';
import { SelectTopicsComponent } from './dialogs/select-topics/select-topics.component';
import { SelectPriceComponent } from './dialogs/select-price/select-price.component';
import { CommunitiesComponent } from './communities/communities.component';
import { SelectDurationComponentComponent } from './dialogs/select-duration-component/select-duration-component.component';
import { GuidesComponent } from './guides/guides.component';
import { QuestionsComponent } from './questions/questions.component';
import { BountiesComponent } from './bounties/bounties.component';
import { LearningPathComponent } from './learning-path/learning-path.component';

@NgModule({
	imports: [
		CommonModule,
		HomeRoutingModule,
		MatTabsModule,
		SharedModule
	],
	declarations: [
		HomeComponent,
		ClassesComponent,
		ExperiencesComponent,
		PeersComponent,
		HomefeedComponent,
		SelectTopicsComponent,
		SelectPriceComponent,
		CommunitiesComponent,
		SelectDurationComponentComponent,
		GuidesComponent,
		QuestionsComponent,
		BountiesComponent,
		LearningPathComponent
	],
	providers: [],
	bootstrap: [SelectTopicsComponent, SelectPriceComponent, SelectDurationComponentComponent]
})
export class HomeModule { }
