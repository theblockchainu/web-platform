import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WhyTeachComponent} from './why-teach/why-teach.component';
import {TeachingBenefitsComponent} from './teaching-benefits/teaching-benefits.component';
import {ResponsibleTeachingComponent} from './responsible-teaching/responsible-teaching.component';
import {AuthGuardService} from '../_services/auth-guard/auth-guard.service';
import {ExperienceIntroComponent} from './experience-intro/experience-intro.component';
import {ClassIntroComponent} from './class-intro/class-intro.component';
import {CommunityIntroComponent} from './community-intro/community-intro.component';
import {PeerIntroComponent} from './peer-intro/peer-intro.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'whyTeach',
                component: WhyTeachComponent
            },
            {
                path: 'teachingBenefits',
                component: TeachingBenefitsComponent
            },
            {
                path: 'responsibleTeaching',
                component: ResponsibleTeachingComponent
            },
			{
				path: 'experiences',
				component: ExperienceIntroComponent
			},
			{
				path: 'classes',
				component: ClassIntroComponent
			},
			{
				path: 'communities',
				component: CommunityIntroComponent
			},
			{
				path: 'peers',
				component: PeerIntroComponent
			}

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DigestRoutingModule { }
