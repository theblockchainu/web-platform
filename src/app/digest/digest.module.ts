import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WhyTeachComponent} from './why-teach/why-teach.component';
import {TeachingBenefitsComponent} from './teaching-benefits/teaching-benefits.component';
import {ResponsibleTeachingComponent} from './responsible-teaching/responsible-teaching.component';
import {DigestRoutingModule} from './digest-routing.module';

@NgModule({
  imports: [
    CommonModule,
    DigestRoutingModule
  ],
  declarations: [WhyTeachComponent, TeachingBenefitsComponent, ResponsibleTeachingComponent]
})
export class DigestModule { }
