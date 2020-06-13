import {Component, OnDestroy, OnInit} from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {DatabaseService} from './services/databas.service';
import {ConnectionService} from 'ng-connection-service';
import {ToastService} from './services/toast.service';
import {User} from '../models/user';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  status = 'Online';
  isConnected = true;
  connexionColor = '';
  user: User;
  constructor(
    private platform: Platform, private databaseService: DatabaseService,
    private splashScreen: SplashScreen, private connectionService: ConnectionService,
    private statusBar: StatusBar, public toast: ToastService) {
    this.initializeApp();
    this.connectionService.monitor().subscribe(isConnected => {
        this.isConnected = isConnected;
        if (this.isConnected) {
          this.status = 'You are Online';
          this.updateLocalStorage('server');
          this.connexionColor = 'isConnected';
        } else {
          this.status = 'You are Offline';
          this.updateLocalStorage('local');
          this.connexionColor = 'isNotConnected';
        }
        this.toast.presentToast(this.status);
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  getLocalStorageData() {
    this.user = JSON.parse(localStorage.getItem('user'));
  }
  updateLocalStorage(domain) {
    this.getLocalStorageData();
    if (this.user === null) {
      this.user = new User();
    }
    this.user.domain = domain;
    localStorage.setItem('user', JSON.stringify(this.user));
  }
}
