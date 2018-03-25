import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexComponent } from './index/index.component';
import { IndexPhilComponent } from './index-philosophy/index-philosophy.component';

import { SharedModule } from '../_shared/_shared.module';
@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [IndexComponent,
    IndexPhilComponent]
})
export class DefaultModule { }
