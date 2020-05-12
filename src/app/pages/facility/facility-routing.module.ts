import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityPage } from './facility.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityPageRoutingModule {}
