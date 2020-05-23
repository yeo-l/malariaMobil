import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {User} from '../../models/user';
import {map} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;
     public  account: User | null = null;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }
    isAuthenticated(): boolean {
        return this.account !== null;
    }

    login(inputUrl: string, username: string, password: string) {
        const bearer = btoa( username + ':' + password);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + bearer
            })
        };
        return this.http.get<any>(inputUrl + '/api/dataSets', httpOptions).pipe(map(data => {
            let user: any = {};
            user.username = username;
            user.url = inputUrl;
            user.password = password;
            user.authdata = bearer;
            user.domain = 'server'
            localStorage.setItem('user', JSON.stringify(user));
            this.userSubject.next(user);
            this.account = user;
            return user;
        }, err => {
            console.log('User authentication failed!', err);
            // console.log('httpOptions', httpOptions);
        }));
    }
    localLogin(authenticatedUser) {
        let user: any = authenticatedUser;
        // user.username = authenticatedUser.username;
        // user.url = authenticatedUser.url;
        // user.password = authenticatedUser.password;
        this.userSubject.next(user);
        this.user = this.userSubject.asObservable();
        user.domain = 'local';
        this.account = user;
        localStorage.setItem('user', JSON.stringify(user));
    }
    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.account = null;
        this.router.navigate(['/login']);
    }
}
