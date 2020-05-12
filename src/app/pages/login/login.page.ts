import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpHeaders} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {AuthenticationService} from '../../services/authentication.service';
import {first} from 'rxjs/operators';

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
    bearer: string;
    constructor(private router: Router, private route: ActivatedRoute,
                private authenticationService: AuthenticationService,
                private dataService: DataService) {
        if (this.authenticationService.userValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        console.log(this.route.snapshot.queryParams['returnUrl'] );
        console.log(this.returnUrl);
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
        this.submitted = true;
        // stop here if form is invalid
        if (this.validateInputs()) {
            this.loading = true;
            this.authenticationService.login(this.inputUrl, this.loginData.username, this.loginData.password)
                .pipe(first())
                .subscribe(data => {
                    console.log('login data', data);
                    this.router.navigate([this.returnUrl]);
                    console.log('is login url', this.returnUrl);
                        // this.router.navigate(['/home']);
                    }, error => {
                        this.error = error;
                        this.loading = false;
                    });
        }
    }

}
