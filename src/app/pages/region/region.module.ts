import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegionPageRoutingModule } from './region-routing.module';
import { RegionPage } from './region.page';
import {IonicSelectableModule} from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegionPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [RegionPage]
})
export class RegionPageModule {}
