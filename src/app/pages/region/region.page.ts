import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';
import {MalariaOrgUnitModel} from '../../../models/malaria-orgUnit-model';

@Component({
  selector: 'app-region',
  templateUrl: './region.page.html',
  styleUrls: ['./region.page.scss'],
})
export class RegionPage implements OnInit {
  dataStore: MalariaDataStoreModel;
  dataStoreData: {};
  regions: any = [{}];
  districts: any = [{}];
  loadingRegionData: boolean = true;
  selectedRegion: string;
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
  constructor(private dataSeries: DataService) { }

  ngOnInit(): void {
    this.dataSeries.getDataStore().subscribe( ds => {
      this.dataStore = ds;
      this.dataStore.indicators.forEach(indicator => {
        if (indicator.dhisID !== null) {
          this.elementName[indicator.dhisID] = indicator.name;
        }
      });
      this.getOrgUnitRegion();
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
  getOrgUnitRegion() {
    this.loadingRegionData = false;
    const params: string[] = ['fields=id,name&filter=level:eq:' + this.dataStore.orgUnitLevel[0].region];
    console.log(this.dataStore.orgUnitLevel[0].region);
    this.dataSeries.loadOrganisationUnits(params).subscribe( (OURegion: any) => {
      this.regions = OURegion.organisationUnits;
      console.log('regiion', this.regions);
    });
  }
  getRegionDataByPeriodFilter() {
    const levelR: string = this.dataStore.orgUnitLevel[0].district;
    console.log(levelR);
    const dx = this.getDimensionDx();
    if (dx !== null) {
      this.dataSeries.getDataByPeriodFilter(this.selectedRegion, dx, levelR).subscribe( (data: any) => {
        const rows = data.rows;
        console.log(data);
        const headers = data.headers;
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
      });
    }
    this.getRegionDataByOrgUnitFilter();
    this.regions.forEach(region => {
      if (region.id === this.selectedRegion) {
        this.selectedRegionName = region.name;
      }
    });
  }
  getRegionDataByOrgUnitFilter() {
    const dx = this.getDimensionDx();
    if (dx !== null) {
      this.dataSeries.getDataByOrgUnitFilter(this.selectedRegion, dx).subscribe((data: any) => {
        const rows = data.rows;
        const headers = data.headers;
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
      });
    }
  }
}
