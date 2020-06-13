import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from './helpers/auth.guard';

const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  // },
  // {
  //   path: '',
  //   loadChildren: () => import('./index/index.module').then( m => m.IndexPageModule)
  // },
  // {
  //   path: '',
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // },
  // {
  //   path: 'welcome',
  //   loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule)
  // },
  {
      path: '',
      loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
    },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },

  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  // {
  //   path: 'region',
  //   loadChildren: () => import('./pages/region/region.module').then( m => m.RegionPageModule)
  // },
  // {
  //   path: 'district',
  //   loadChildren: () => import('./pages/district/district.module').then( m => m.DistrictPageModule)
  // },
  // {
  //   path: 'facility',
  //   loadChildren: () => import('./pages/facility/facility.module').then( m => m.FacilityPageModule)
  // }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
