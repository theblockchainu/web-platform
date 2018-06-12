import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CalendarComponent } from './calendar-component.component';
import { MatIconModule } from '@angular/material';
import { CalendarModule } from 'angular-calendar';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        CalendarModule.forRoot()
    ],
    exports: [
        CalendarComponent,
    ],
    declarations: [
        CalendarComponent,
    ],
    providers: [],
})
export class CalendarCustomModule { }
