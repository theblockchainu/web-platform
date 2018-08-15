import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadDocsComponent } from './upload-docs/upload-docs.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';

const routes: Routes = [
	{
		path: '',
		children: [
			{
				path: ':step',
				component: UploadDocsComponent,
				canActivateChild: [AuthGuardService]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes, {ScrollPositionRestoration: 'enabled'})],
	exports: [RouterModule]
})
export class VerificationRoutingModule { }
