import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CommunityPageComponent} from './community-page.component';
import {CommunityPageQuestionsComponent} from './community-page-questions/community-page-questions.component';
import {CommunityPageClassesComponent} from './community-page-classes/community-page-classes.component';
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
                path: 'classes',
                component: CommunityPageClassesComponent
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
    imports: [RouterModule.forChild(routes, {ScrollPositionRestoration: 'enabled'})],
    exports: [RouterModule]
})
export class CommunityPageRoutingModule {
}
