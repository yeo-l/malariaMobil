import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {AuthenticationService} from '../../services/authentication.service';
import {first} from 'rxjs/operators';
import {ToastService} from '../../services/toast.service';
import {DatabaseService} from '../../services/databas.service';
import {IUser} from '../../../models/user';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
    loginData = {username: '', password: ''};
    inputUrl: '';
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    users: IUser[] = [];
    user = {};
    constructor(private router: Router, private route: ActivatedRoute, private db: DatabaseService,
                private authenticationService: AuthenticationService,
                private dataService: DataService, private toastService: ToastService) {
        if (this.authenticationService.userValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.db.getDatabaseState().subscribe(rdy => {
            if (rdy) {
                this.db.getUser().subscribe(data => {
                    this.users = data;
                });
            }
        });
    }
    validateInputs() {
        const username = this.loginData.username.trim();
        const password = this.loginData.password.trim();
        const inputUrl = this.inputUrl.trim();
        return (
            this.inputUrl &&
            this.loginData.username &&
            this.loginData.password &&
            username.length > 0 &&
            password.length > 0 &&
            inputUrl.length > 0
        );
    }
    login() {
        this.submitted = true;
        if (this.validateInputs()) {
            this.loading = true;
            this.authenticationService.login(this.inputUrl, this.loginData.username, this.loginData.password)
                .pipe(first())
                .subscribe(data => {
                    this.db.addUser(this.loginData.username, this.inputUrl, this.loginData.password);
                    this.toastService.presentToast('You are connected.');
                    this.router.navigate([this.returnUrl]);
                }, (error: any) => {
                    if (this.authenticationService.isAuthenticated() === false) {
                        this.db.authenticateLocalUser(this.inputUrl, this.loginData.username, this.loginData.password)
                            .then((s: any) => {
                                if (this.authenticationService.isAuthenticated()) {
                                    this.toastService.presentToast('You are connected.');
                                    this.router.navigate([this.returnUrl]);
                                } else {
                                    this.toastService.presentToast('you are not authenticated.');
                                }
                            });
                    }
                });
        } else {
            this.toastService.presentToast(
                'Please enter url and username and password.'
            );
        }
    }

}
