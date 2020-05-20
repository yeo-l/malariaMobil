import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';
import {DatabaseService} from '../../services/databas.service';
import {User} from '../../../models/user';
import {OrganisationUnit} from '../../../models/organisationUnit';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.page.html',
    styleUrls: ['./welcome.page.scss'],
})

export class WelcomePage implements OnInit {
    dataStore: MalariaDataStoreModel = new MalariaDataStoreModel();
    user: User;
    organisationUnits: OrganisationUnit[];

    constructor(private router: Router, private dataService: DataService, private databaseService: DatabaseService) {
    }

    ngOnInit() {
        this.getIndicatorDataStore();
    }
    navigateToLogin() {
        this.router.navigate(['/login']);
    }
    async getIndicatorDataStore(): Promise<void> {
        this.getLocalStorageData();
        if (this.user.domain === 'server') {
            await this.dataService.getDataStore().subscribe(dataStore => {
                this.dataStore = dataStore;
                this.databaseService.loadDataStore(this.user.url)
                    .then( result => {
                        if (result.rows.length === 0) {
                            this.databaseService.saveDataStore(this.user.url, JSON.stringify(this.dataStore)).then();
                        } else {
                            this.databaseService.updateDataStore(this.user.url, JSON.stringify(this.dataStore)).then();
                        }
                    });
                this.loadServerOrgUnit();
            });
        } else if (this.user.domain === 'local') {
            this.databaseService.loadDataStore(this.user.url).then( result => {
                if (result.rows.length > 0) {
                    this.dataStore = JSON.parse(result.rows.item(0).dataValues);
                }
            });
        }
    }
    getLocalStorageData() {
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    loadServerOrgUnit() {
        const params: string[] = ['fields=id,name,level'];
        this.dataService.loadOrganisationUnits(params).subscribe( result => {
            this.databaseService.loadOrganisationUnit(this.user.url).then( res => {
                if (res.rows.length === 0) {
                    this.databaseService.saveOrgUnit(this.user.url, JSON.stringify(result)).then();
                } else {
                    this.databaseService.updateOrgUnit(this.user.url, JSON.stringify(this.dataStore)).then();
                }
            });
        });
    }
}
