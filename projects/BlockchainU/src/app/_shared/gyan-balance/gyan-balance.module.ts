import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GyanBalancePipe } from './gyan-balance.pipe';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [GyanBalancePipe],
  exports: [GyanBalancePipe]
})
export class GyanBalanceModule { }
