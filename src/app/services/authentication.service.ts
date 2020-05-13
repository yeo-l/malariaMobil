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
            user.authdata = bearer;
            localStorage.setItem('user', JSON.stringify(user));
            this.userSubject.next(user);
            return user;
        }, err => {
            console.log('User authentication failed!', err);
            // console.log('httpOptions', httpOptions);
        }));
    }
    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }
}
