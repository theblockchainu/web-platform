import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomCertificateFormComponent } from './custom-certificate-form.component';
import {
  MatDatepickerModule, MatCardModule, MatFormFieldModule, MatButtonToggleModule,
  MatIconModule, MatSelectModule, MatInputModule, MatButtonModule
} from '@angular/material';
import { ColorPickerModule } from 'primeng/primeng';
import { ReactiveFormsModule } from '@angular/forms';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';

@NgModule({
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatCardModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatButtonModule,
    ColorPickerModule,
    MatSelectModule,
    MatInputModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.threeBounce,
      backdropBackgroundColour: 'rgba(0,0,0,0)',
      backdropBorderRadius: '0px',
      primaryColour: '#33bd9e',
      secondaryColour: '#ff5b5f',
      tertiaryColour: '#ff6d71'
    }),
  ],
  declarations: [CustomCertificateFormComponent],
  exports: [CustomCertificateFormComponent]
})
export class CustomCertificateFormModule { }
