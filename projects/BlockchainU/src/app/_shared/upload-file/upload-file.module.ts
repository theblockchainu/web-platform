import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFileComponent } from './upload-file.component';
import { FileUploadModule } from 'primeng/fileupload';
import { MatProgressBarModule } from '@angular/material';
@NgModule({
  imports: [
    CommonModule,
    FileUploadModule,
    MatProgressBarModule
  ],
  exports: [UploadFileComponent],
  declarations: [UploadFileComponent]
})
export class UploadFileModule { }
