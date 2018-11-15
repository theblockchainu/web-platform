import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';

@NgModule({
  imports: [
    CommonModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.threeBounce,
      backdropBackgroundColour: 'rgba(0,0,0,0)',
      backdropBorderRadius: '0px',
      primaryColour: '#33bd9e',
      secondaryColour: '#ff5b5f',
      tertiaryColour: '#ff6d71'
    }),
  ],
  declarations: [],
  exports: [
    LoadingModule
  ]
})
export class SharedModule { }
