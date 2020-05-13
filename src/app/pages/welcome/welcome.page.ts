import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})

export class WelcomePage implements OnInit {
  dataStore: MalariaDataStoreModel = new MalariaDataStoreModel();

  constructor(private router: Router, private dataSeries: DataService) { }

  ngOnInit() {
    this.getIndicatorDataStore();
  }
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  async getIndicatorDataStore(): Promise<void> {
    await this.dataSeries.getDataStore().subscribe(dataStore => {
      this.dataStore = dataStore;
      console.log(this.dataStore);
    });
  }
}
