import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SocialSyncComponent } from './socialsync.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    exports: [
        SocialSyncComponent,
    ],
    declarations: [
        SocialSyncComponent,
    ],
    providers: [],
})
export class SocialSyncModule { }
