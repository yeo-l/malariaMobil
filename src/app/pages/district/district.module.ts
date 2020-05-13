import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DistrictPageRoutingModule } from './district-routing.module';

import { DistrictPage } from './district.page';
import {IonicSelectableModule} from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonicSelectableModule,
    DistrictPageRoutingModule
  ],
  declarations: [DistrictPage]
})
export class DistrictPageModule {}
