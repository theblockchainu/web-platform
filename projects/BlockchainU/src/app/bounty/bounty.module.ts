import { NgModule } from '@angular/core';
import { SharedModule } from '../_shared/_shared.module';
import { BountyRoutingModule } from './bounty-routing.module';
import { BountyEditComponent } from './bounty-edit/bounty-edit.component';
import { BountyContentComponent } from './bounty-content/bounty-content.component';
import { BountyContentProjectComponent } from './bounty-content-project/bounty-content-project.component';
import { BountyContentVideoComponent } from './bounty-content-video/bounty-content-video.component';
import { ContentViewComponent } from './content-view/content-view.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { BountyContentInpersonComponent } from './bounty-content-inperson/bounty-content-inperson.component';
import { AddLocationDialogComponent } from './add-location-dialog/add-location-dialog.component';
import { DataSharingService } from '../_services/data-sharing-service/data-sharing.service';

@NgModule({
    imports: [
        SharedModule,
        BountyRoutingModule
    ],
    declarations: [
        BountyEditComponent,
        BountyContentComponent,
        ContentViewComponent,
        AppointmentCalendarComponent,
        BountyContentProjectComponent,
        BountyContentVideoComponent,
        BountyContentInpersonComponent,
        AddLocationDialogComponent],
    providers: [DataSharingService],
    bootstrap: [],
    entryComponents: [BountyContentProjectComponent,
        BountyContentVideoComponent, BountyContentInpersonComponent, AddLocationDialogComponent]
})
export class BountyModule { }
