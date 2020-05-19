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
    loginData = {
        username: '',
        password: ''
    };
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
                    console.log('====> user change in oninit of page.ts ====>' + JSON.stringify(data) );
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
    // connectedLogin() {
    //     const auth = this.dataService.loadToken();
    //     if (auth) {
    //         this.router.navigate(['/home/welcome']);
    //     } else {
    //         if (this.validateInputs()) {
    //             console.log('url', this.inputUrl);
    //             console.log('user', this.loginData.username);
    //             console.log('password', this.loginData.password);
    //             this.router.navigate(['/home']);
    //             this.getUrl();
    //         }
    //     }
    // }
    // getUrl() {
    //     this.bearer = btoa( this.loginData.username + ':' + this.loginData.password);
    //     console.log('bearer: ', this.bearer);
    //     const httpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json',
    //             'Authorization': 'Basic ' + this.bearer
    //         })
    //     };
    //     // console.log(btoa( this.loginData.username + ':' + this.loginData.password));
    //     // console.log( this.loginData.username + ':' + this.loginData.password);
    //     // let options = new RequestOptions({ headers: headers });
    //     this.dataService.getUrl(this.inputUrl + '/api/login', httpOptions).subscribe((data: any) => {
    //         console.log('data', data);
    //     }, err => {
    //         console.log('User authentication failed!', err);
    //         // console.log('httpOptions', httpOptions);
    //     });
    // }
    login() {
        const loadauthdata = 'abctest';
        this.db.addUser(this.loginData.username, this.inputUrl, this.loginData.password, loadauthdata);
        // this.submitted = true;
        // // stop here if form is invalid
        // if (this.validateInputs()) {
        //     this.loading = true;
        //     this.authenticationService.login(this.inputUrl, this.loginData.username, this.loginData.password)
        //         .pipe(first())
        //         .subscribe(data => {
        //             this.toastService.presentToast('You are connected.');
        //             this.router.navigate([this.returnUrl]);
        //             }, (error: any) => {
        //             this.toastService.presentToast('Network Issue.');
        //         });
        // } else {
        //     this.toastService.presentToast(
        //         'Please enter url and username and password.'
        //     );
        // }
    }

}
