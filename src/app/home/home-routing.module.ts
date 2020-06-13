import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      // {
      //   path: '',
      //   loadChildren: () =>
      //       import('../pages/login/login.module').then(m => m.LoginPageModule)
      // },
      {
        path: '',
        loadChildren: () =>
            import('../pages/welcome/welcome.module').then(m => m.WelcomePageModule)
      },
      {
        path: 'welcome',
        loadChildren: () =>
            import('../pages/welcome/welcome.module').then(m => m.WelcomePageModule)
      },
      {
        path: 'region',
        loadChildren: () =>
            import('../pages/region/region.module').then(m => m.RegionPageModule)
      },
      {
        path: 'district',
        loadChildren: () =>
            import('../pages/district/district.module').then(
                m => m.DistrictPageModule
            )
      },
      {
        path: 'facility',
        loadChildren: () =>
            import('../pages/facility/facility.module').then(
                m => m.FacilityPageModule
            )
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
