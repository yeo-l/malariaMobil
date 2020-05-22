import { Component, OnInit } from '@angular/core';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';
import {DataService} from '../../services/data.service';
import {IonicSelectableComponent} from 'ionic-selectable';
import {DatabaseService} from '../../services/databas.service';
import {User} from '../../../models/user';
import {OrganisationUnit} from '../../../models/organisationUnit';

@Component({
  selector: 'app-facility',
  templateUrl: './facility.page.html',
  styleUrls: ['./facility.page.scss'],
})
export class FacilityPage implements OnInit {
  dataStore: MalariaDataStoreModel;
  facilities: any = [{}];
  selectedFacility: any = [];
  elementName: {} = {};
  facilityInGray = 0; facilityInRed = 0;
  facilityInGreen = 0; facilityInYellow = 0;
  facilityDataByCommunity: string[][] = [];
  facilityDataHeaders: any = [];
  facilityDataByChwPeriod: string[][] = [];
  facilityDataHeadersByPeriod: any = [];
  selectedFacilityName: string;
  chws: any = [{}];
  user: User;
  organisationUnits: OrganisationUnit[];

  constructor(private dataService: DataService, private databaseService: DatabaseService) { }

  ngOnInit() {
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
          this.getOrgUnitFacility(parseInt(this.dataStore.orgUnitLevel[0].facility, 10));
        }
      });
    }
    // this.dataService.getDataStore().subscribe( ds => {
    //   this.dataStore = ds;
    //   this.dataStore.indicators.forEach(indicator => {
    //     if (indicator.dhisID !== null) {
    //       this.elementName[indicator.dhisID] = indicator.name;
    //     }
    //   });
    //   this.getOrgUnitFacility();
    // });
  }

  getOrgUnitFacility(level: number) {
    this.databaseService.loadOrganisationUnit(this.user.url).then( result => {
      if (result.rows.length > 0) {
        this.organisationUnits = JSON.parse(result.rows.item(0).orgUnitData).organisationUnits;
        this.facilities = this.organisationUnits.filter(orgUnit => orgUnit.level === level);
      }
    });

  }
  getLocalStorageData() {
    this.user = JSON.parse(localStorage.getItem('user'));
  }
  // getOrgUnitFacility() {
  //   const params: string[] = ['fields=id,name&filter=level:eq:' + this.dataStore.orgUnitLevel[0].facility];
  //   this.dataService.loadOrganisationUnits(params).subscribe( (facilityData: any) => {
  //     this.facilities = facilityData.organisationUnits;
  //   });
  // }
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

  getFacilityDataByPeriodFilter() {
    this.facilityDataByCommunity = [];
    this.facilityDataHeaders = [];
    if (this.user.domain === 'server') {
      const levelR: string = this.dataStore.orgUnitLevel[0].chw;
      const dx = this.getDimensionDx();
      if (dx !== null) {
        this.dataService.getDataByPeriodFilter(this.selectedFacility.id, dx, levelR).subscribe( (data: any) => {
          this.getAnalyticsDataByOrgUnit(data.rows, data.headers);
          this.getFacilityDataByOrgUnitFilter(data);
        });
      }
      this.facilities.forEach(facility => {
        if (facility.id === this.selectedFacility.id) {
          this.selectedFacilityName = facility.name;
        }
      });
    } else if (this.user.domain === 'local') {
      this.databaseService.loadAnalyticsData(this.user.url, this.selectedFacility.id).then( result => {
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
    this.facilityDataByCommunity = [];
    this.facilityDataHeaders = [];
    this.facilityInGreen = 0;
    this.facilityInGray = 0;
    this.facilityInYellow = 0;
    this.facilityInRed = 0;
    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i];
      let count = 0;
      const columnData: string[] = [];
      for (let j = 0; j < columns.length; j++) {
        if (headers[j].column === 'dataid') {
          columnData[count] = this.elementName[columns[j]];
          this.facilityDataHeaders[count] = 'Indicators';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.facilityDataHeaders[count] = headers[j].column;
          count ++;
          if (parseFloat(columns[j]) >= 70) {
            this.facilityInGreen ++;
          }
          if (parseFloat(columns[j]) < 40) {
            this.facilityInRed ++;
          }
          if (isNaN(parseFloat(columns[j]))) {
            this.facilityInGray ++;
          }
          if (parseFloat(columns[j]) < 70 && parseFloat(columns[j]) >= 40) {
            this.facilityInYellow ++;
          }
        }
      }
      this.facilityDataByCommunity.push(columnData);
    }
    console.log('header',  this.facilityDataHeaders);
    console.log('columnd', this.facilityDataByCommunity);
  }

  getAnalyticsDataByPeriod(rows: any, headers: any) {
    this.facilityDataByChwPeriod = [];
    this.facilityDataHeadersByPeriod = [];
    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i];
      let count = 0;
      const columnData: string[] = [];
      for (let j = 0; j < columns.length; j++) {
        if (headers[j].column === 'dataid') {
          columnData[count] = this.elementName[columns[j]];
          this.facilityDataHeadersByPeriod[count] = 'Indicators';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.facilityDataHeadersByPeriod[count] = headers[j].column;
          count ++;
        }
      }
      this.facilityDataByChwPeriod.push(columnData);
    }
  }

  getFacilityDataByOrgUnitFilter(filterPeriodData) {
    this.facilityDataByChwPeriod = [];
    this.facilityDataHeadersByPeriod = [];
    const dx = this.getDimensionDx();
    if (dx !== null) {
      this.dataService.getDataByOrgUnitFilter(this.selectedFacility.id, dx).subscribe((data: any) => {
        this.getAnalyticsDataByPeriod(data.rows, data.headers);
        this.databaseService.loadAnalyticsData(this.user.url, this.selectedFacility.id).then( result => {
          if (result.rows.length > 0) {
            this.databaseService.updateAnalyticsData(this.user.url, this.selectedFacility.id, JSON.stringify(filterPeriodData), JSON.stringify(data)).then();
          } else {
            this.databaseService.saveAnalyticsData(this.user.url, this.selectedFacility.id,  JSON.stringify(filterPeriodData), JSON.stringify(data)).then();
          }
        });
      });
    }
  }
  
  // getFacilityDataByPeriodFilter() {
  //   const dx = this.getDimensionDx();
  //   const levelF: string = this.dataStore.orgUnitLevel[0].chw;
  //   if (dx !== null) {
  //     this.dataService.getDataByPeriodFilter(this.selectedFacility.id, dx, levelF).subscribe( (data: any) => {
  //       const rows = data.rows;
  //       const headers = data.headers;
  //       this.facilityDataByCommunity = [];
  //       this.facilityDataHeaders = [];
  //       this.facilityInGreen = 0;
  //       this.facilityInGray = 0;
  //       this.facilityInYellow = 0;
  //       this.facilityInRed   = 0;
  //       for (let i = 0; i < rows.length; i++) {
  //         const columns = rows[i];
  //         let count = 0;
  //         const columnData: string[] = [];
  //         for (let j = 0; j < columns.length; j++) {
  //           if (headers[j].column === 'dataid') {
  //             columnData[count] = this.elementName[columns[j]];
  //             this.facilityDataHeaders[count] = 'Indicators';
  //             count++;
  //           } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
  //             columnData[count] = columns[j];
  //             this.facilityDataHeaders[count] = headers[j].column;
  //             count ++;
  //             if (parseFloat(columns[j]) >= 70) {
  //               this.facilityInGreen ++;
  //             }
  //             if (parseFloat(columns[j]) < 40) {
  //               this.facilityInRed ++;
  //             }
  //             if (isNaN(parseFloat(columns[j]))) {
  //               this.facilityInGray ++;
  //             }
  //             if (parseFloat(columns[j]) < 70 && parseFloat(columns[j]) >= 40) {
  //               this.facilityInYellow ++;
  //             }
  //           }
  //         }
  //         this.facilityDataByCommunity.push(columnData);
  //       }
  //     });
  //     this.getFacilityDataByOrgUnitFilter();
  //    // this.getDistrictDataByOrgUnitFilter();
  //     this.facilities.forEach(facility => {
  //       if (facility.id === this.selectedFacility.id) {
  //         this.selectedFacilityName = facility.name;
  //       }
  //     });
  //   }
  // }
  // getFacilityDataByOrgUnitFilter() {
  //   const dx = this.getDimensionDx();
  //   if (dx !== null) {
  //     this.dataService.getDataByOrgUnitFilter(this.selectedFacility.id, dx).subscribe((data: any) => {
  //       const rows = data.rows;
  //       const headers = data.headers;
  //       this.facilityDataByChwPeriod = [];
  //       this.facilityDataHeadersByPeriod = [];
  //       for (let i = 0; i < rows.length; i++) {
  //         const columns = rows[i];
  //         let count = 0;
  //         const columnData: string[] = [];
  //         for (let j = 0; j < columns.length; j++) {
  //           if (headers[j].column === 'dataid') {
  //             columnData[count] = this.elementName[columns[j]];
  //             this.facilityDataHeadersByPeriod[count] = 'Indicators';
  //             count++;
  //           } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
  //             columnData[count] = columns[j];
  //             this.facilityDataHeadersByPeriod[count] = headers[j].column;
  //             count++;
  //           }
  //         }
  //         this.facilityDataByChwPeriod.push(columnData);
  //       }
  //     });
  //   }
  // }
  // getOrgUnitChw() {
  //   const params: string[] = ['fields=id,name&filter=level:eq:' + this.dataStore.orgUnitLevel[0].facility];
  //   this.dataService.loadOrganisationUnits(params).subscribe( (chwData: any) => {
  //     this.chws = chwData.organisationUnits;
  //   });
  // }
  facChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('facility:', event.value);
  }
}
