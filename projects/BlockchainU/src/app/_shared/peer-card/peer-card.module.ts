import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeerCardComponent } from './peer-card.component';
import { RouterModule } from '@angular/router';
import { RatingModule } from 'primeng/primeng';
import { MatTooltipModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { GyanBalanceModule } from '../gyan-balance/gyan-balance.module';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RatingModule,
    MatTooltipModule,
    FormsModule,
    GyanBalanceModule
  ],
  declarations: [PeerCardComponent],
  exports: [PeerCardComponent]
})
export class PeerCardModule { }
