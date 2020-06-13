import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';
import {IonicSelectableComponent} from 'ionic-selectable';
import {DatabaseService} from '../../services/databas.service';
import {User} from '../../../models/user';
import {OrganisationUnit} from '../../../models/organisationUnit';
import {ToastService} from '../../services/toast.service';
import htmlToImage from 'html-to-image';
import {File, IWriteOptions} from '@ionic-native/file/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-district',
  templateUrl: './district.page.html',
  styleUrls: ['./district.page.scss'],
})
export class DistrictPage implements OnInit {
  dataStore: MalariaDataStoreModel;
  districts: any = [{}];
  elementName: {} = {};
  districtDataByFacility: string[][] = [];
  districtDataHeaders: any = [];
  districtDataByDistrictPeriod: string[][] = [];
  districtDataHeadersByPeriod: any = [];
  selectedDistrictName: string;
  selectedDistrict: any = [];
  targetInfo: {} = {};
  orgUnitDataColors: string[][] = [[]];
  periodDataColors: string[][] = [[]];
  user: User;
  organisationUnits: OrganisationUnit[];
  viewShare = false;
  htmlToImage: any = {};
  loadingRegionData: boolean = true;

  constructor(private dataService: DataService, private databaseService: DatabaseService,
              public toast: ToastService, private file: File, private socialSharing: SocialSharing) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'));
    if (this.user.url) {
      this.databaseService.loadDataStore(this.user.url).then( result => {
        if (result.rows.length > 0) {
          this.dataStore = JSON.parse(result.rows.item(0).dataValues);
          this.dataStore.indicators.forEach(indicator => {
            if (indicator.dhisID !== null && indicator.dhisID !== '') {
              this.elementName[indicator.dhisID] = indicator.name;
              this.targetInfo[indicator.dhisID + '.achieved'] = indicator.achieved;
              this.targetInfo[indicator.dhisID + '.target'] = indicator.target;
              this.targetInfo[indicator.dhisID + '.notInTrack'] = indicator.notInTrack;
            }
          });
          this.getOrgUnitDistrict(parseInt(this.dataStore.orgUnitLevel[0].district, 10));
        }
      });
    }
  }

  getColor(target: number, value: number, achieved: number, notInTrack: number): string {
    return this.dataService.getColor(target, value, achieved, notInTrack);
  }

  getLocalStorageData() {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  getOrgUnitDistrict(level: number) {
    this.loadingRegionData = false;
    this.databaseService.loadOrganisationUnit(this.user.url).then( result => {
      if (result.rows.length > 0) {
        this.organisationUnits = JSON.parse(result.rows.item(0).orgUnitData).organisationUnits;
        this.districts = this.organisationUnits.filter(orgUnit => orgUnit.level === level);
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

  getDistrictDataByPeriodFilter() {
    this.viewShare = true;
    this.districtDataByFacility = [];
    this.districtDataHeaders = [];
    this.districtDataByDistrictPeriod = [];
    this.districtDataHeadersByPeriod = [];
    this.orgUnitDataColors.splice(0, this.orgUnitDataColors.length);
    this.periodDataColors.splice(0, this.periodDataColors.length);
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
    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i];
      let count = 0;
      const columnData: string[] = [];
      const colors = [];
      let id = '';
      for (let j = 0; j < columns.length; j++) {
        id = columns[0];
        if (headers[j].column === 'dataid') {
          columnData[count] = this.elementName[columns[j]];
          this.districtDataHeaders[count] = 'Indicators';
          colors[count] = '';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.districtDataHeaders[count] = headers[j].column;
          colors[count] = this.getColor(parseFloat(this.targetInfo[id + '.target']),
              parseFloat(columnData[count]),
              parseFloat(this.targetInfo[id + '.achieved']),
              parseFloat(this.targetInfo[id + '.notInTrack']));
          count ++;
        }
      }
      this.orgUnitDataColors[i] = colors;
      this.districtDataByFacility.push(columnData);
    }
  }

  getAnalyticsDataByPeriod(rows: any, headers: any) {
    this.districtDataByDistrictPeriod = [];
    this.districtDataHeadersByPeriod = [];
    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i];
      let count = 0;
      let id = '';
      const colors = [];
      const columnData: string[] = [];
      for (let j = 0; j < columns.length; j++) {
        if (headers[j].column === 'dataid') {
          columnData[count] = this.elementName[columns[j]];
          id = columns[j];
          this.districtDataHeadersByPeriod[count] = 'Indicators';
          colors[count] = '';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.districtDataHeadersByPeriod[count] = headers[j].column;
          colors[count] = this.getColor(parseFloat(this.targetInfo[id + '.target']),
              parseFloat(columnData[count]),
              parseFloat(this.targetInfo[id + '.achieved']),
              parseFloat(this.targetInfo[id + '.notInTrack']));
          count ++;
        }
      }
      this.periodDataColors[i] = colors;
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

  disChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('redion:', event.value);
  }

  shareTwitterPeriod() {
    const node = document.getElementById('district_period');
    node.classList.remove('table-responsive');
    node.classList.remove('data-mobile-responsive');
    const option: IWriteOptions = {replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'regionByPeriod_table.png', this.htmlToImage, option)
              .then(async r => {
                node.className += ' table-responsive data-mobile-responsive';
                await this.socialSharing.shareViaTwitter(null, `${this.file.dataDirectory}/files/regionByPeriod_table.png`, null)
                    .then(async o => {
                    }).catch(e => {
                    });
              });
        });
  }

  shareViaFacebookPeriod() {
    const node = document.getElementById('district_period');
    node.classList.remove('table-responsive');
    node.classList.remove('data-mobile-responsive');
    const option: IWriteOptions = {replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'regionByPeriod_table.png', this.htmlToImage, option)
              .then(async r => {
                node.className += ' table-responsive data-mobile-responsive';
                await this.socialSharing.shareViaFacebook(null, `${this.file.dataDirectory}/files/regionByPeriod_table.png`, null)
                    .then(async o => {
                    }).catch(e => {
                    });
              });
        });
  }

  shareViaWhatsappPeriod() {
    const node = document.getElementById('district_period');
    node.classList.remove('table-responsive');
    node.classList.remove('data-mobile-responsive');
    const option: IWriteOptions = {replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'regionByPeriod_table.png', this.htmlToImage, option)
              .then(async r => {
                node.className += ' table-responsive data-mobile-responsive';
                await this.socialSharing.shareViaWhatsApp(null, `${this.file.dataDirectory}/files/regionByPeriod_table.png`, null)
                    .then(async o => {
                    }).catch(e => {
                    });
              });
        });
  }

  shareViaInstagramPeriode() {
    const node = document.getElementById('district_period');
    node.classList.remove('table-responsive');
    node.classList.remove('data-mobile-responsive');
    const option: IWriteOptions = {replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'regionByPeriod_table.png', this.htmlToImage, option)
              .then(async r => {
                node.className += ' table-responsive data-mobile-responsive';
                await this.socialSharing.shareViaInstagram(null, `${this.file.dataDirectory}/files/regionByPeriod_table.png`)
                    .then(async o => {
                    }).catch(e => {
                    });
              });
        });
  }

  shareViaTwitter() {
    const node = document.getElementById('district_table');
    node.classList.remove('table-responsive');
    node.classList.remove('data-mobile-responsive');
    const options: IWriteOptions = { replace: true};
    htmlToImage.toBlob(node).then(async (dataUrl) => {
      this.htmlToImage = dataUrl;
      await this.file.writeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png', this.htmlToImage , options )
          .then(async result => {
            node.className += ' table-responsive data-mobile-responsive';
            await this.socialSharing.shareViaTwitter(null, `${this.file.dataDirectory}/files/malariaSc_table.png`, null)
                .then(async o => {
                }).catch(e => {});
          });
    });
  }

  shareViaFacebook() {
    const node = document.getElementById('district_table');
    node.classList.remove('table-responsive');
    node.classList.remove('data-mobile-responsive');
    const option: IWriteOptions = {replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'regionByDistrict_table.png', this.htmlToImage, option)
              .then(async r => {
                node.className += ' table-responsive data-mobile-responsive';
                await this.socialSharing.shareViaFacebook(null, `${this.file.dataDirectory}/files/regionByDistrict_table.png`, null)
                    .then(async o => {
                    }).catch(e => {
                    });
              });
        });
  }

  shareViaWhatsapp() {
    const node = document.getElementById('district_table');
    node.classList.remove('table-responsive');
    node.classList.remove('data-mobile-responsive');
    const option: IWriteOptions = {replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'regionByDistrict_table.png', this.htmlToImage, option)
              .then(async r => {
                node.className += ' table-responsive data-mobile-responsive';
                await this.socialSharing.shareViaWhatsApp(null, `${this.file.dataDirectory}/files/regionByDistrict_table.png`, null)
                    .then(async o => {
                    }).catch(e => {
                    });
              });
        });
  }

  shareViaInstagram() {
    const node = document.getElementById('district_table');
    node.classList.remove('table-responsive');
    node.classList.remove('data-mobile-responsive');
    const option: IWriteOptions = {replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'regionByDistrict_table.png', this.htmlToImage, option)
              .then(async r => {
                node.className += ' table-responsive data-mobile-responsive';
                await this.socialSharing.shareViaInstagram(null, `${this.file.dataDirectory}/files/regionByDistrict_table.png`)
                    .then(async o => {
                    }).catch(e => {
                    });
              });
        });
  }
}
