import { NgModule } from '@angular/core';
import { SharedModule } from '../_shared/_shared.module';
import { GuideRoutingModule } from './guide-routing.module';
import { GuideEditComponent } from './guide-edit/guide-edit.component';
import { GuideContentComponent } from './guide-content/guide-content.component';
import { GuideContentProjectComponent } from './guide-content-project/guide-content-project.component';
import { GuideContentVideoComponent } from './guide-content-video/guide-content-video.component';
import { ContentViewComponent } from './content-view/content-view.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { GuideContentInpersonComponent } from './guide-content-inperson/guide-content-inperson.component';
import { AddLocationDialogComponent } from './add-location-dialog/add-location-dialog.component';
import { DataSharingService } from '../_services/data-sharing-service/data-sharing.service';

@NgModule({
    imports: [
        SharedModule,
        GuideRoutingModule
    ],
    declarations: [
        GuideEditComponent,
        GuideContentComponent,
        ContentViewComponent,
        AppointmentCalendarComponent,
        GuideContentProjectComponent,
        GuideContentVideoComponent,
        GuideContentInpersonComponent,
        AddLocationDialogComponent],
    providers: [DataSharingService],
    bootstrap: [],
    entryComponents: [GuideContentProjectComponent,
        GuideContentVideoComponent, GuideContentInpersonComponent, AddLocationDialogComponent]
})
export class GuideModule { }
