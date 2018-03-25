import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionRoutingModule } from './session-routing.module';
import { SessionEditComponent } from './session-edit/session-edit.component';

import { SharedModule } from '../_shared/_shared.module';
import { BookSessionComponent } from './book-session/book-session.component';
@NgModule({
  imports: [
    CommonModule,
    SessionRoutingModule,
    SharedModule
  ],
  declarations: [SessionEditComponent, BookSessionComponent]
})
export class SessionModule { }
