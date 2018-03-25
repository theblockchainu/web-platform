import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuardService} from '../_services/auth-guard/auth-guard.service';

import {HomeComponent} from './home.component';
import {HomefeedComponent} from './homefeed/homefeed.component';
import {WorkshopsComponent} from './workshops/workshops.component';
import {ExperiencesComponent} from './experiences/experiences.component';
import {PeersComponent} from './peers/peers.component';
import {CommunitiesComponent} from './communities/communities.component';

const routes: Routes = [{
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuardService],
    children: [
        {
            path: 'homefeed',
            component: HomefeedComponent
        },
        {
            path: 'communities',
            component: CommunitiesComponent
        },
        {
            path: 'workshops',
            component: WorkshopsComponent
        },
        {
            path: 'experiences',
            component: ExperiencesComponent
        },
        {
            path: 'peers',
            component: PeersComponent
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule {
}
