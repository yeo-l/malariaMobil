import { Injectable } from '@angular/core';
import {SQLitePorter} from '@ionic-native/sqlite-porter/ngx';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {Platform} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {IUser} from '../../models/user';
import {AuthenticationService} from './authentication.service';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    users = new BehaviorSubject([]);
    private database: SQLiteObject;
    private databaseReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor( private sqLitePorter: SQLitePorter, private sqLite: SQLite,
                 private platform: Platform, private http: HttpClient, private authenticationService: AuthenticationService) {
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
                        users.push( {
                           username: res.rows.item(i).username,
                           url: res.rows.item(i).url,
                           password: res.rows.item(i).password,
                           domain : res.rows.item(i).domain,
                        });
                    }
                }
                this.users.next(users);
            });
    }
    addUser(username, url, password) {
        const data = [username, url, password];
        this.getOneUser(url, password, username).then(dataUser => {
            if (dataUser.rows.length === 0) {
                const sql = 'INSERT INTO scoreUser (username, url, password ) VALUES (?, ?, ?)';
                return this.database.executeSql(sql, data)
                    .then(dataS => {
                        this.loadUser();
                    });
            }
        });
    }
    getOneUser(url, password, userName) {
        return this.database.executeSql('SELECT * FROM scoreUser WHERE username = ? AND url = ? AND password = ?', [userName, url, password]);
    }
    authenticateLocalUser(url, password, userName) {
        return this.database.executeSql('SELECT * FROM scoreUser WHERE username = ? AND url = ? AND password = ?', [password, url, userName ])
            .then(_ => {
                if (_.rows.length === 1) {
                    this.authenticationService.localLogin(_.rows.item(0));
                } else {
                    console.log('=====> localSorage is empty ====>');
                }
            });
    }
    saveDataStore(url, data) {
        return this.database.executeSql('INSERT INTO dataStore (instanceUrl, dataValues ) VALUES (?, ?)', [url, data]);
    }
    loadDataStore(url) {
        return this.database.executeSql('SELECT * FROM dataStore WHERE instanceUrl= ?', [url]);
    }
    loadAnalyticsData(url, orgUnitID) {
        return this.database.executeSql('SELECT * FROM analyticsData where url= ? AND orgUnitID= ?', [url, orgUnitID]);
    }
    saveAnalyticsData(url: string, orgUnitID: string, orgUnitData: string, periodData: string) {
        const dateCreated = new Date();
        return this.database.executeSql('INSERT INTO analyticsData (url, dateCreated, period, orgUnitID, orgUnitData, periodData, monthExecuted, yearExecuted ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [url, dateCreated, 'LAST_12_MONTHS', orgUnitID, orgUnitData, periodData, dateCreated.getMonth(), dateCreated.getFullYear()]);
    }
    updateAnalyticsData(url: string, orgUnitID: string, orgUnitData: string, periodData: string) {
        const dateCreated = new Date();
        return this.database.executeSql('UPDATE analyticsData SET period = ?, orgUnitID = ?, orgUnitData = ?, periodData = ?, monthExecuted = ?, yearExecuted = ?  WHERE url = ? AND orgUnitID = ?', ['LAST_12_MONTHS', orgUnitData, periodData, dateCreated.getMonth(), dateCreated.getFullYear(), url, orgUnitID ]);

    }
    updateDataStore(url: string, data: string) {
        return this.database.executeSql('UPDATE dataStore SET  dataValues = ? WHERE instanceUrl = ?', [data, url]);
    }
    loadOrganisationUnit(url: string) {
        return this.database.executeSql('SELECT * FROM organisationUnit WHERE url= ?', [url]);
    }
    saveOrgUnit(url: string, orgUnitData: string) {
        return this.database.executeSql('INSERT INTO organisationUnit (url, orgUnitData ) VALUES (?, ?)', [url, orgUnitData]);
    }
    updateOrgUnit(url: string, orgUnitData: string) {
        return this.database.executeSql('UPDATE organisationUnit SET  orgUnitData = ? WHERE url = ?', [orgUnitData, url]);

    }
}
