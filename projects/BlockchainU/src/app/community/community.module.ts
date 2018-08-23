import { NgModule } from '@angular/core';
import { SharedModule } from '../_shared/_shared.module';
import { CommunityRoutingModule } from './community-routing.module';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { CommunityEditComponent } from './community-edit/community-edit.component';

@NgModule({
    imports: [
        SharedModule,
        CommunityRoutingModule
    ],
    declarations: [
        CommunityEditComponent,
        AppointmentCalendarComponent
    ],
    providers: [],
    bootstrap: [],
    entryComponents: []
})
export class CommunityModule { }
