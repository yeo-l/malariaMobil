import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {User} from '../../models/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  user: User;

  constructor(private authenticationService: AuthenticationService, private router: Router) {
    this.authenticationService.user.subscribe(x => this.user = x);
  }

  ngOnInit() {
  }
  logout() {
    this.authenticationService.logout();
  }
}
