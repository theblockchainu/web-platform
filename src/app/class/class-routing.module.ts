import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClassEditComponent } from './class-edit/class-edit.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':collectionId',
        loadChildren: './class-page/class-page.module#ClassPageModule'
      },
      {
        path: ':collectionId/edit/:step',
        component: ClassEditComponent,
        canActivateChild: [AuthGuardService]
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes, {ScrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class ClassRoutingModule { }
