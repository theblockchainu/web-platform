import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CommunityPageComponent} from './community-page.component';
import {CommunityPageQuestionsComponent} from './community-page-questions/community-page-questions.component';
import {CommunityPageWorkshopsComponent} from './community-page-workshops/community-page-workshops.component';
import {CommunityPageExperiencesComponent} from './community-page-experiences/community-page-experiences.component';
import {CommunityPageLinksComponent} from './community-page-links/community-page-links.component';

const routes: Routes = [
    {
        path: '',
        component: CommunityPageComponent,
        children: [
            {
                path: 'questions',
                component: CommunityPageQuestionsComponent
            },
            {
                path: 'workshops',
                component: CommunityPageWorkshopsComponent
            },
            {
                path: 'experiences',
                component: CommunityPageExperiencesComponent
            },
            {
                path: 'links',
                component: CommunityPageLinksComponent
            },
            {
                path: '',
                component: CommunityPageQuestionsComponent
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
