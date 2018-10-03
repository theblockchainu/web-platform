import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { HomefeedComponent } from './homefeed/homefeed.component';
import { ClassesComponent } from './classes/classes.component';
import { ExperiencesComponent } from './experiences/experiences.component';
import { PeersComponent } from './peers/peers.component';
import { CommunitiesComponent } from './communities/communities.component';
import { GuidesComponent } from './guides/guides.component';
import { QuestionsComponent } from './questions/questions.component';
import { BountiesComponent } from './bounties/bounties.component';
const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'homefeed',
		component: HomefeedComponent
	},
	{
		path: 'communities',
		component: CommunitiesComponent
	},
	{
		path: 'classes',
		component: ClassesComponent
	},
	{
		path: 'experiences',
		component: ExperiencesComponent
	},
	{
		path: 'guides',
		component: GuidesComponent
	},
	{
		path: 'questions',
		component: QuestionsComponent
	},
	{
		path: 'peers',
		component: PeersComponent
	}, {
		path: 'bounties',
		component: BountiesComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HomeRoutingModule {
}
