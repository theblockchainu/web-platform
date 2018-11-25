import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfilePopupComponent } from './profile-popup.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ProfilePopupComponent
  ],
  exports: [ProfilePopupComponent]
})
export class ProfilePopupModule { }
