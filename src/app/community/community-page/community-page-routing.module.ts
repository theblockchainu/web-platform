import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuardService} from '../../_services/auth-guard/auth-guard.service';
import {CommunityPageComponent} from './community-page.component';
import {CommunityPageQuestionsComponent} from './community-page-questions/community-page-questions.component';
import {CommunityPageWorkshopsComponent} from './community-page-workshops/community-page-workshops.component';
import {CommunityPageExperiencesComponent} from './community-page-experiences/community-page-experiences.component';
import {CommunityPageLinksComponent} from './community-page-links/community-page-links.component';

const routes: Routes = [
    {
        path: '',
        component: CommunityPageComponent,
        canActivate: [AuthGuardService],
        children: [
            {
                path: 'questions',
                component: CommunityPageQuestionsComponent,
                canActivateChild: [AuthGuardService]
            },
            {
                path: 'workshops',
                component: CommunityPageWorkshopsComponent,
                canActivateChild: [AuthGuardService]
            },
            {
                path: 'experiences',
                component: CommunityPageExperiencesComponent,
                canActivateChild: [AuthGuardService]
            },
            {
                path: 'links',
                component: CommunityPageLinksComponent,
                canActivateChild: [AuthGuardService]
            },
            {
                path: '',
                component: CommunityPageQuestionsComponent,
                canActivateChild: [AuthGuardService]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommunityPageRoutingModule {
}
