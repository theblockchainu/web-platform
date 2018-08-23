import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppFooterComponent } from './app-footer.component';
import { SharedModule } from '../_shared/_shared.module';
import {RouterModule} from '@angular/router';
@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule
	],
	declarations: [
		AppFooterComponent
	],
	exports: [AppFooterComponent]
})
export class AppFooterModule { }
