import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WhyTeachComponent} from './why-teach/why-teach.component';
import {TeachingBenefitsComponent} from './teaching-benefits/teaching-benefits.component';
import {ResponsibleTeachingComponent} from './responsible-teaching/responsible-teaching.component';
import {AuthGuardService} from '../_services/auth-guard/auth-guard.service';

const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuardService],
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
            }

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DigestRoutingModule { }
