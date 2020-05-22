import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';
import {IonicSelectableComponent} from 'ionic-selectable';
import {DatabaseService} from '../../services/databas.service';
import {User} from '../../../models/user';
import {OrganisationUnit} from '../../../models/organisationUnit';

@Component({
  selector: 'app-district',
  templateUrl: './district.page.html',
  styleUrls: ['./district.page.scss'],
})
export class DistrictPage implements OnInit {
  dataStore: MalariaDataStoreModel;
  districts: any = [{}];
  elementName: {} = {};
  districtInGray = 0; districtInRed = 0;
  districtInGreen = 0; districtInYellow = 0;
  districtDataByFacility: string[][] = [];
  districtDataHeaders: any = [];
  districtDataByDistrictPeriod: string[][] = [];
  districtDataHeadersByPeriod: any = [];
  selectedDistrictName: string;
  selectedDistrict: any = [];
  user: User;
  organisationUnits: OrganisationUnit[];

  constructor(private dataService: DataService, private databaseService: DatabaseService) { }

  ngOnInit() {
    // this.dataSeries.getDataStore().subscribe( ds => {
    //   this.dataStore = ds;
    //   this.dataStore.indicators.forEach(indicator => {
    //     if (indicator.dhisID !== null) {
    //       this.elementName[indicator.dhisID] = indicator.name;
    //     }
    //   });
    //   this.getOrgUnitDistrict();
    // });
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
          this.getOrgUnitDistrict(parseInt(this.dataStore.orgUnitLevel[0].district, 10));
        }
      });
    }

  }
  getLocalStorageData() {
    this.user = JSON.parse(localStorage.getItem('user'));
  }
  getOrgUnitDistrict(level: number) {
    this.databaseService.loadOrganisationUnit(this.user.url).then( result => {
      if (result.rows.length > 0) {
        this.organisationUnits = JSON.parse(result.rows.item(0).orgUnitData).organisationUnits;
        this.districts = this.organisationUnits.filter(orgUnit => orgUnit.level === level);
      }
    });

  }
  // getOrgUnitDistrict() {
  //   const params: string[] = ['fields=id,name&filter=level:eq:' + this.dataStore.orgUnitLevel[0].district];
  //   this.dataSeries.loadOrganisationUnits(params).subscribe( (DistrictData: any) => {
  //     this.districts = DistrictData.organisationUnits;
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

  getDistrictDataByPeriodFilter() {
    this.districtDataByFacility = [];
    this.districtDataHeaders = [];
    if (this.user.domain === 'server') {
      const levelR: string = this.dataStore.orgUnitLevel[0].facility;
      const dx = this.getDimensionDx();
      if (dx !== null) {
        this.dataService.getDataByPeriodFilter(this.selectedDistrict.id, dx, levelR).subscribe( (data: any) => {
          this.getAnalyticsDataByOrgUnit(data.rows, data.headers);
          this.getDistrictDataByOrgUnitFilter(data);
        });
      }
      this.districts.forEach(district => {
        if (district.id === this.selectedDistrict.id) {
          this.selectedDistrictName = district.name;
        }
      });
    } else if (this.user.domain === 'local') {
      this.databaseService.loadAnalyticsData(this.user.url, this.selectedDistrict.id).then( result => {
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
    this.districtDataByFacility = [];
    this.districtDataHeaders = [];
    this.districtInGreen = 0;
    this.districtInGray = 0;
    this.districtInYellow = 0;
    this.districtInRed = 0;
    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i];
      let count = 0;
      const columnData: string[] = [];
      for (let j = 0; j < columns.length; j++) {
        if (headers[j].column === 'dataid') {
          columnData[count] = this.elementName[columns[j]];
          this.districtDataHeaders[count] = 'Indicators';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.districtDataHeaders[count] = headers[j].column;
          count ++;
          if (parseFloat(columns[j]) >= 70) {
            this.districtInGreen ++;
          }
          if (parseFloat(columns[j]) < 40) {
            this.districtInRed ++;
          }
          if (isNaN(parseFloat(columns[j]))) {
            this.districtInGray ++;
          }
          if (parseFloat(columns[j]) < 70 && parseFloat(columns[j]) >= 40) {
            this.districtInYellow ++;
          }
        }
      }
      this.districtDataByFacility.push(columnData);
    }
    console.log('header',  this.districtDataHeaders);
    console.log('columnd', this.districtDataByFacility);
  }

  getAnalyticsDataByPeriod(rows: any, headers: any) {
    this.districtDataByDistrictPeriod = [];
    this.districtDataHeadersByPeriod = [];
    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i];
      let count = 0;
      const columnData: string[] = [];
      for (let j = 0; j < columns.length; j++) {
        if (headers[j].column === 'dataid') {
          columnData[count] = this.elementName[columns[j]];
          this.districtDataHeadersByPeriod[count] = 'Indicators';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.districtDataHeadersByPeriod[count] = headers[j].column;
          count ++;
        }
      }
      this.districtDataByDistrictPeriod.push(columnData);
    }
  }

  getDistrictDataByOrgUnitFilter(filterPeriodData) {
    this.districtDataByDistrictPeriod = [];
    this.districtDataHeadersByPeriod = [];
    const dx = this.getDimensionDx();
    if (dx !== null) {
      this.dataService.getDataByOrgUnitFilter(this.selectedDistrict.id, dx).subscribe((data: any) => {
        this.getAnalyticsDataByPeriod(data.rows, data.headers);
        this.databaseService.loadAnalyticsData(this.user.url, this.selectedDistrict.id).then( result => {
          if (result.rows.length > 0) {
            this.databaseService.updateAnalyticsData(this.user.url, this.selectedDistrict.id, JSON.stringify(filterPeriodData), JSON.stringify(data)).then();
          } else {
            this.databaseService.saveAnalyticsData(this.user.url, this.selectedDistrict.id,  JSON.stringify(filterPeriodData), JSON.stringify(data)).then();
          }
        });
      });
    }
  }

  // getDistrictDataByPeriodFilter() {
  //   const dx = this.getDimensionDx();
  //   const levelD: string = this.dataStore.orgUnitLevel[0].facility;
  //   if (dx !== null) {
  //     this.dataSeries.getDataByPeriodFilter(this.selectedDistrict.id, dx, levelD).subscribe((data: any) => {
  //       const rows = data.rows;
  //       const headers = data.headers;
  //       this.districtDataByFacility = [];
  //       this.districtDataHeaders = [];
  //       this.districtInGreen = 0;
  //       this.districtInGray = 0;
  //       this.districtInYellow = 0;
  //       this.districtInRed = 0;
  //       for (let i = 0; i < rows.length; i++) {
  //         const columns = rows[i];
  //         let count = 0;
  //         const columnData: string[] = [];
  //         for (let j = 0; j < columns.length; j++) {
  //           if (headers[j].column === 'dataid') {
  //             columnData[count] = this.elementName[columns[j]];
  //             this.districtDataHeaders[count] = 'Indicators';
  //             count++;
  //           } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
  //             columnData[count] = columns[j];
  //             this.districtDataHeaders[count] = headers[j].column;
  //             count ++;
  //             if (parseFloat(columns[j]) >= 70) {
  //               this.districtInGreen ++;
  //             }
  //             if (parseFloat(columns[j]) < 40) {
  //               this.districtInRed ++;
  //             }
  //             if (isNaN(parseFloat(columns[j]))) {
  //               this.districtInGray ++;
  //             }
  //             if (parseFloat(columns[j]) < 70 && parseFloat(columns[j]) >= 40) {
  //               this.districtInYellow ++;
  //             }
  //           }
  //         }
  //         this.districtDataByFacility.push(columnData);
  //       }
  //     });
  //   }
  //   this.getDistrictDataByOrgUnitFilter();
  //   this.districts.forEach(district => {
  //     if (district.id === this.selectedDistrict.id) {
  //       this.selectedDistrictName = district.name;
  //     }
  //   });
  // }
  // getDistrictDataByOrgUnitFilter() {
  //   const dx = this.getDimensionDx();
  //   if (dx !== null) {
  //     this.dataSeries.getDataByOrgUnitFilter(this.selectedDistrict.id, dx).subscribe((data: any) => {
  //       const rows = data.rows;
  //       const headers = data.headers;
  //       this.districtDataByDistrictPeriod = [];
  //       this.districtDataHeadersByPeriod = [];
  //       for (let i = 0; i < rows.length; i++) {
  //         const columns = rows[i];
  //         let count = 0;
  //         const columnData: string[] = [];
  //         for (let j = 0; j < columns.length; j++) {
  //           if (headers[j].column === 'dataid') {
  //             columnData[count] = this.elementName[columns[j]];
  //             this.districtDataHeadersByPeriod[count] = 'Indicators';
  //             count++;
  //           } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
  //             columnData[count] = columns[j];
  //             this.districtDataHeadersByPeriod[count] = headers[j].column;
  //             count++;
  //           }
  //         }
  //         this.districtDataByDistrictPeriod.push(columnData);
  //       }
  //     });
  //   }
  // }


  disChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('redion:', event.value);
  }
}
