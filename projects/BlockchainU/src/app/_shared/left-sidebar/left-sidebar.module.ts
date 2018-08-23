import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeftSidebarRoutingModule } from './left-sidebar-routing.module';
import { LeftSidebarComponent } from './left-sidebar.component';
import { MatSidenavModule, MatIconModule, MatListModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    LeftSidebarRoutingModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule
  ],
  declarations: [LeftSidebarComponent],
  exports: [
    LeftSidebarComponent
  ]
})
export class LeftSidebarModule { }
