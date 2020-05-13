import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';

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
  selectedDistrict: string;

  constructor(private dataSeries: DataService) { }

  ngOnInit() {
    this.dataSeries.getDataStore().subscribe( ds => {
      this.dataStore = ds;
      this.dataStore.indicators.forEach(indicator => {
        if (indicator.dhisID !== null) {
          this.elementName[indicator.dhisID] = indicator.name;
        }
      });
      this.getOrgUnitDistrict();
    });

  }
  getOrgUnitDistrict() {
    const params: string[] = ['fields=id,name&filter=level:eq:' + this.dataStore.orgUnitLevel[0].district];
    this.dataSeries.loadOrganisationUnits(params).subscribe( (DistrictData: any) => {
      this.districts = DistrictData.organisationUnits;
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
  getDistrictDataByPeriodFilter() {
    const dx = this.getDimensionDx();
    const levelD: string = this.dataStore.orgUnitLevel[0].facility;
    if (dx !== null) {
      this.dataSeries.getDataByPeriodFilter(this.selectedDistrict, dx, levelD).subscribe((data: any) => {
        const rows = data.rows;
        const headers = data.headers;
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
      });
    }
    this.getDistrictDataByOrgUnitFilter();
    this.districts.forEach(district => {
      if (district.id === this.selectedDistrict) {
        this.selectedDistrictName = district.name;
      }
    });
  }
  getDistrictDataByOrgUnitFilter() {
    const dx = this.getDimensionDx();
    if (dx !== null) {
      this.dataSeries.getDataByOrgUnitFilter(this.selectedDistrict, dx).subscribe((data: any) => {
        const rows = data.rows;
        const headers = data.headers;
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
              count++;
            }
          }
          this.districtDataByDistrictPeriod.push(columnData);
        }
      });
    }
  }
}
