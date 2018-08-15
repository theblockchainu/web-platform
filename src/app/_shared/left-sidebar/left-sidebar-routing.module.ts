import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes, {ScrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class LeftSidebarRoutingModule { }
