import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';
import {IonicSelectableComponent} from 'ionic-selectable';
import {User} from '../../../models/user';
import {OrganisationUnit} from '../../../models/organisationUnit';
import {DatabaseService} from '../../services/databas.service';
import {SharingService} from '../../services/sharing.service';

@Component({
  selector: 'app-region',
  templateUrl: './region.page.html',
  styleUrls: ['./region.page.scss'],
})
export class RegionPage implements OnInit {
  dataStore: MalariaDataStoreModel;
  regions: any = [{}];
  districts: any = [{}];
  // loadingRegionData: boolean = true;
  selectedRegion: any = [];
  elementName: {} = {};
  regionDataByDistrict: string[][] = [];
  regionDataHeaders: any = [];
  regionDataByDistrictPeriod: string[][] = [];
  regionDataHeadersByPeriod: any = [];
  regionInGray = 0;
  regionInRed = 0;
  regionInGreen = 0;
  regionInYellow = 0;
  selectedRegionName: string;

  user: User;
  organisationUnits: OrganisationUnit[];

  constructor(private dataService: DataService, private databaseService: DatabaseService, private sharingService: SharingService) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    if (this.user.url) {
      this.databaseService.loadDataStore(this.user.url).then( result => {
        if (result.rows.length > 0) {
          this.dataStore = JSON.parse(result.rows.item(0).dataValues);
          this.dataStore.indicators.forEach(indicator => {
            if (indicator.dhisID !== null) {
              this.elementName[indicator.dhisID] = indicator.name;
            }
          });
          this.getOrgUnitRegion(parseInt(this.dataStore.orgUnitLevel[0].region, 10));
        }
      });
    }
  }

  getLocalStorageData() {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  getOrgUnitRegion(level: number) {
    this.databaseService.loadOrganisationUnit(this.user.url).then( result => {
      if (result.rows.length > 0) {
        this.organisationUnits = JSON.parse(result.rows.item(0).orgUnitData).organisationUnits;
        this.regions = this.organisationUnits.filter(orgUnit => orgUnit.level === level);
      }
    });

  }

  getDimensionDx() {
    const elements: string[] = [];
    for (let i = 0 ; i < this.dataStore.indicators.length; i++) {
      if (this.dataStore.indicators[i].dhisID) {
        elements[i] = this.dataStore.indicators[i].dhisID;
      }
    }
    if (elements.length) {
      return elements.join(';');
    }
    return null;
  }

  getRegionDataByPeriodFilter() {
    this.regionDataByDistrict = [];
    this.regionDataHeaders = [];
    if (this.user.domain === 'server') {
      const levelR: string = this.dataStore.orgUnitLevel[0].district;
      const dx = this.getDimensionDx();
      if (dx !== null) {
        this.dataService.getDataByPeriodFilter(this.selectedRegion.id, dx, levelR).subscribe( (data: any) => {
            this.getAnalyticsDataByOrgUnit(data.rows, data.headers);
            this.getRegionDataByOrgUnitFilter(data);
        });
      }
      this.regions.forEach(region => {
        if (region.id === this.selectedRegion.id) {
          this.selectedRegionName = region.name;
        }
      });
    } else if (this.user.domain === 'local') {
      this.databaseService.loadAnalyticsData(this.user.url, this.selectedRegion.id).then( result => {
        if (result.rows.length > 0) {
          const orgUnitData = JSON.parse(result.rows.item(0).orgUnitData);
          const periodData = JSON.parse(result.rows.item(0).periodData);
          this.getAnalyticsDataByPeriod(periodData.rows, periodData.headers);
          this.getAnalyticsDataByOrgUnit(orgUnitData.rows, orgUnitData.headers);
        }
      });
    }
  }

  getAnalyticsDataByOrgUnit(rows: any, headers: any) {
    this.regionDataByDistrict = [];
    this.regionDataHeaders = [];
    this.regionInGreen = 0;
    this.regionInGray = 0;
    this.regionInYellow = 0;
    this.regionInRed = 0;
    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i];
      let count = 0;
      const columnData: string[] = [];
      for (let j = 0; j < columns.length; j++) {
        if (headers[j].column === 'dataid') {
          columnData[count] = this.elementName[columns[j]];
          this.regionDataHeaders[count] = 'Indicators';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.regionDataHeaders[count] = headers[j].column;
          count ++;
          if (parseFloat(columns[j]) >= 70) {
            this.regionInGreen ++;
          }
          if (parseFloat(columns[j]) < 40) {
            this.regionInRed ++;
          }
          if (isNaN(parseFloat(columns[j]))) {
            this.regionInGray ++;
          }
          if (parseFloat(columns[j]) < 70 && parseFloat(columns[j]) >= 40) {
            this.regionInYellow ++;
          }
        }
      }
      this.regionDataByDistrict.push(columnData);
    }
    console.log('header',  this.regionDataHeaders);
    console.log('columnd', this.regionDataByDistrict);
  }

  getAnalyticsDataByPeriod(rows: any, headers: any) {
    this.regionDataByDistrictPeriod = [];
    this.regionDataHeadersByPeriod = [];
    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i];
      let count = 0;
      const columnData: string[] = [];
      for (let j = 0; j < columns.length; j++) {
        if (headers[j].column === 'dataid') {
          columnData[count] = this.elementName[columns[j]];
          this.regionDataHeadersByPeriod[count] = 'Indicators';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.regionDataHeadersByPeriod[count] = headers[j].column;
          count ++;
        }
      }
      this.regionDataByDistrictPeriod.push(columnData);
    }
  }

  getRegionDataByOrgUnitFilter(filterPeriodData) {
    this.regionDataByDistrictPeriod = [];
    this.regionDataHeadersByPeriod = [];
    const dx = this.getDimensionDx();
    if (dx !== null) {
      this.dataService.getDataByOrgUnitFilter(this.selectedRegion.id, dx).subscribe((data: any) => {
        this.getAnalyticsDataByPeriod(data.rows, data.headers);
        this.databaseService.loadAnalyticsData(this.user.url, this.selectedRegion.id).then( result => {
          if (result.rows.length > 0) {
            this.databaseService.updateAnalyticsData(this.user.url, this.selectedRegion.id, JSON.stringify(filterPeriodData), JSON.stringify(data)).then();
        } else {
            this.databaseService.saveAnalyticsData(this.user.url, this.selectedRegion.id,  JSON.stringify(filterPeriodData), JSON.stringify(data)).then();
          }
        });
      });
    }
  }

  onChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('redion:', event.value);
  }
  shareTwitter() {
    this.sharingService.shareTwitter();
  }
  shareWhatsApp() {}
}
