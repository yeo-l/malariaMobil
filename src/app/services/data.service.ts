import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IMalariaDataStoreModel} from '../../models/malaria.data.store.model';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private httpClient: HttpClient) {
  }
  // getUrl(url: string, httpOptions) {
  //   return this.httpClient.get(url, httpOptions);
  // }
  getDataStore() {
    const user = JSON.parse(localStorage.getItem('user'));
    return this.httpClient.get<IMalariaDataStoreModel>( user.url + '/api/dataStore/malariaSoreCard/indicator');
  }
  loadMetaData(metaData: string, params: string[]) {
    const user = JSON.parse(localStorage.getItem('user'));
    return this.httpClient.get<[]>(user.url + '/api/' + metaData + '?paging=false' + (params ? '&' + params.join('&') : ''));
  }

  loadOrganisationUnits(params) {
    return this.loadMetaData('organisationUnits', params);
  }
  getDataByPeriodFilter(orgUnitId: string, dx: string, lv: string) {
    const user = JSON.parse(localStorage.getItem('user'));
    return this.httpClient.get(user.url + '/api/analytics.json?dimension=ou:' + orgUnitId + ';LEVEL-' + lv + '&dimension=dx:' + dx +
        '&rows=dx&columns=ou&displayProperty=NAME&showHierarchy=true&hideEmptyColumns=true&' +
        'filter=pe:LAST_12_MONTHS&' +
        'hideEmptyRows=true&ignoreLimit=true&tableLayout=true');
  }
  getDataByOrgUnitFilter(orgUnitId: string, dx: string) {
    const user = JSON.parse(localStorage.getItem('user'));
    return this.httpClient.get(user.url + '/api/analytics.json?dimension=pe:LAST_12_MONTHS' + '&dimension=dx:' + dx +
        '&rows=dx&columns=pe' + '&displayProperty=NAME&showHierarchy=true&hideEmptyColumns=false&' +
        '&filter=ou:' + orgUnitId + '&hideEmptyRows=true&ignoreLimit=true&tableLayout=true');
  }
  getColor(target: number, value: number, achieved: number, notInTrack: number): string {
    const red = 'bg-red';
    const green = 'bg-green';
    const yellow = 'bg-yellow';
    const gray = 'bg-gray';
    if (isNaN(value)) {
      return gray;
    } else {
      if (target === 0) {
        if (value < achieved ) {
          return green;
        } else if (value < notInTrack && value >= achieved) {
          return yellow;
        } else {
          return red;
        }
      } else {
        if (value >= achieved ) {
          return green;
        } else if (value > notInTrack && value < achieved) {
          return yellow;
        } else {
          return red;
        }
      }
    }
  }

}
