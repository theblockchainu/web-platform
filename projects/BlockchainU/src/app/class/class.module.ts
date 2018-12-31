import { NgModule } from '@angular/core';
import { SharedModule } from '../_shared/_shared.module';
import { ClassRoutingModule } from './class-routing.module';
import { ClassEditComponent } from './class-edit/class-edit.component';
import { ClassContentComponent } from './class-content/class-content.component';
import { ClassContentOnlineComponent } from './class-content-online/class-content-online.component';
import { ClassContentProjectComponent } from './class-content-project/class-content-project.component';
import { ClassContentVideoComponent } from './class-content-video/class-content-video.component';
import { ContentViewComponent } from './content-view/content-view.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { ClassContentQuizComponent } from './class-content-quiz/class-content-quiz.component';
import { DataSharingService } from '../_services/data-sharing-service/data-sharing.service';

@NgModule({
    imports: [
        SharedModule,
        ClassRoutingModule,

    ],
    declarations: [
        ClassEditComponent,
        ClassContentComponent,
        ContentViewComponent,
        AppointmentCalendarComponent,
        ClassContentOnlineComponent,
        ClassContentProjectComponent,
        ClassContentVideoComponent,
        ClassContentQuizComponent
    ],
    providers: [DataSharingService],
    bootstrap: [],
    entryComponents: [ClassContentOnlineComponent, ClassContentProjectComponent, ClassContentVideoComponent, ClassContentQuizComponent]
})
export class ClassModule { }
