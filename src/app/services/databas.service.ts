import { Injectable } from '@angular/core';
import {SQLitePorter} from '@ionic-native/sqlite-porter/ngx';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {Platform} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {IUser} from '../../models/user';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    users = new BehaviorSubject([]);
    private database: SQLiteObject;
    private databaseReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor( private sqLitePorter: SQLitePorter, private sqLite: SQLite,
                 private platform: Platform, private http: HttpClient) {
            this.platform.ready().then(() => {
                this.sqLite.create({
                    name: 'scoreCard.db',
                    location: 'default'
                }).then((db: SQLiteObject) => {
                    this.database = db;
                    this.seedDatabase();
                });
            });
    }
    seedDatabase() {
        this.http.get('assets/seed.sql', {responseType: 'text'})
            .subscribe(sql => {
                this.sqLitePorter.importSqlToDb(this.database, sql)
                    .then(_ => {
                        this.loadUser();
                        this.databaseReady.next(true);
                    }).catch(e => console.log(e));
            });
    }
    getDatabaseState() {
        return this.databaseReady.asObservable();
    }
    getUser(): Observable<IUser[]> {
        return this.users.asObservable();
    }
    loadUser() {
        return this.database.executeSql('SELECT * FROM scoreUser', [])
            .then(res => {
                const users: IUser[] = [];
                if (res.rows.length > 0) {
                    for (let i = 0; i < res.rows.length; i++) {
                        users.push({
                           username: res.rows.item(i).username,
                           url: res.rows.item(i).url,
                           password: res.rows.item(i).password,
                        });
                    }
                    console.log('get Users', users);
                }
                this.users.next(users);
            });
    }
    addUser(username, url, password, authdata) {
        const data = [username, url, password, authdata];
        const sql = 'INSERT INTO scoreUser (username, url, password, authdata) VALUES (?, ?, ?, ?)';
        return this.database.executeSql(sql, data)
            .then(dataS => {
            this.loadUser();
        });
    }
    getOneUser(url, password, userName) {
        return this.database.executeSql('SELECT * FROM scoreUser WHERE username = ? AND url = ? AND password = ?', [userName, url, password])
            .then(_ => {});
    }
    loadDataStore() {
        return this.database.executeSql('SELECT * FROM dataStore', [])
            .then(_ => {});
    }
    loadOrganisationUnit() {
        return this.database.executeSql('SELECT * FROM organisationUnit', [])
            .then(_ => {});
    }
    loadAnalyticsData() {
        return this.database.executeSql('SELECT * FROM analyticsData', [])
            .then(_ => {});
    }
}
