import { Component, OnInit } from '@angular/core';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';
import {DataService} from '../../services/data.service';
import {IonicSelectableComponent} from 'ionic-selectable';

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

  constructor(private dataSeries: DataService) { }

  ngOnInit() {
    this.dataSeries.getDataStore().subscribe( ds => {
      this.dataStore = ds;
      this.dataStore.indicators.forEach(indicator => {
        if (indicator.dhisID !== null) {
          this.elementName[indicator.dhisID] = indicator.name;
        }
      });
      this.getOrgUnitFacility();
    });
  }
  getOrgUnitFacility() {
    const params: string[] = ['fields=id,name&filter=level:eq:' + this.dataStore.orgUnitLevel[0].facility];
    this.dataSeries.loadOrganisationUnits(params).subscribe( (facilityData: any) => {
      this.facilities = facilityData.organisationUnits;
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
  getFacilityDataByPeriodFilter() {
    const dx = this.getDimensionDx();
    const levelF: string = this.dataStore.orgUnitLevel[0].chw;
    if (dx !== null) {
      this.dataSeries.getDataByPeriodFilter(this.selectedFacility.id, dx, levelF).subscribe( (data: any) => {
        const rows = data.rows;
        const headers = data.headers;
        this.facilityDataByCommunity = [];
        this.facilityDataHeaders = [];
        this.facilityInGreen = 0;
        this.facilityInGray = 0;
        this.facilityInYellow = 0;
        this.facilityInRed   = 0;
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
      });
      this.getFacilityDataByOrgUnitFilter();
     // this.getDistrictDataByOrgUnitFilter();
      this.facilities.forEach(facility => {
        if (facility.id === this.selectedFacility.id) {
          this.selectedFacilityName = facility.name;
        }
      });
    }
  }
  getFacilityDataByOrgUnitFilter() {
    const dx = this.getDimensionDx();
    if (dx !== null) {
      this.dataSeries.getDataByOrgUnitFilter(this.selectedFacility.id, dx).subscribe((data: any) => {
        const rows = data.rows;
        const headers = data.headers;
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
              count++;
            }
          }
          this.facilityDataByChwPeriod.push(columnData);
        }
      });
    }
  }
  getOrgUnitChw() {
    const params: string[] = ['fields=id,name&filter=level:eq:' + this.dataStore.orgUnitLevel[0].facility];
    this.dataSeries.loadOrganisationUnits(params).subscribe( (chwData: any) => {
      this.chws = chwData.organisationUnits;
    });
  }
  facChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('facility:', event.value);
  }
}
