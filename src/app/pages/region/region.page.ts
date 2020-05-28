import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {MalariaDataStoreModel} from '../../../models/malaria.data.store.model';
import {IonicSelectableComponent} from 'ionic-selectable';
import {User} from '../../../models/user';
import {OrganisationUnit} from '../../../models/organisationUnit';
import {DatabaseService} from '../../services/databas.service';
import {SharingService} from '../../services/sharing.service';
import {ExportAsConfig, ExportAsService} from 'ngx-export-as';
import {ToastService} from '../../services/toast.service';
import htmlToImage from 'html-to-image';
import {File, IWriteOptions} from '@ionic-native/file/ngx';
// import { saveAs } from 'file-saver';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {Platform} from '@ionic/angular';

@Component({
  selector: 'app-region',
  templateUrl: './region.page.html',
  styleUrls: ['./region.page.scss'],
})
export class RegionPage implements OnInit {
  dataStore: MalariaDataStoreModel;
  regions: any = [{}];
  districts: any = [{}];
  viewShare: boolean = false;
  // loadingRegionData: boolean = true;
  selectedRegion: any = [];
  elementName: {} = {};
  regionDataByDistrict: string[][] = [];
  regionDataHeaders: any = [];
  regionDataByDistrictPeriod: string[][] = [];
  regionDataHeadersByPeriod: any = [];
  selectedRegionName: string;
  targetInfo: {} = {};
  orgUnitDataColors: string[][] = [[]];
  periodDataColors: string[][] = [[]];

  user: User;
  organisationUnits: OrganisationUnit[];
  htmlToImage: any = {};
  // exportAsConfig: ExportAsConfig = {
  //   type: 'png',
  //   elementIdOrContent: 'score_table',
  //   fileName: 'malariaImage'
  // };
  constructor(private dataService: DataService, private databaseService: DatabaseService, private platform: Platform,
              private sharingService: SharingService, private exportAsService: ExportAsService,
              public toast: ToastService, private file: File, private socialSharing: SocialSharing) { }

  ngOnInit(): void {
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
          this.getOrgUnitRegion(parseInt(this.dataStore.orgUnitLevel[0].region, 10));
        }
      });
     }
    this.platform.ready().then(() => {
      console.log(this.file.dataDirectory);
      this.file.writeFile(`${this.file.dataDirectory}/files`, 'score_table', 'text.txt');
      this.file.createFile(`${this.file.dataDirectory}/files`, 'table2', true);
    });
  }
  getColor(target: number, value: number, achieved: number, notInTrack: number): string {
    return this.dataService.getColor(target, value, achieved, notInTrack);
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
    this.viewShare = true;
    this.regionDataByDistrict = [];
    this.regionDataHeaders = [];
    this.regionDataByDistrictPeriod = [];
    this.regionDataHeadersByPeriod = [];
    this.orgUnitDataColors.splice(0, this.orgUnitDataColors.length);
    this.periodDataColors.splice(0, this.periodDataColors.length);
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
        // } else {
        //   this.toast.presentToast('You are Offline please click on refresh button.');
        //   this.clear();
        // }
      });
    }
  }

  getAnalyticsDataByOrgUnit(rows: any, headers: any) {
    this.regionDataByDistrict = [];
    this.regionDataHeaders = [];
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
          this.regionDataHeaders[count] = 'Indicators';
          colors[count] = '';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.regionDataHeaders[count] = headers[j].column;
          colors[count] = this.getColor(parseFloat(this.targetInfo[id + '.target']),
              parseFloat(columnData[count]),
              parseFloat(this.targetInfo[id + '.achieved']),
              parseFloat(this.targetInfo[id + '.notInTrack']));
          count ++;
        }
      }
      this.orgUnitDataColors[i] = colors;
      this.regionDataByDistrict.push(columnData);
    }
  }

  getAnalyticsDataByPeriod(rows: any, headers: any) {
    this.regionDataByDistrictPeriod = [];
    this.regionDataHeadersByPeriod = [];
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
          this.regionDataHeadersByPeriod[count] = 'Indicators';
          colors[count] = '';
          count++;
        } else if (headers[j].column !== 'datacode' && headers[j].column !== 'datadescription' && headers[j].column !== 'dataname') {
          columnData[count] = columns[j];
          this.regionDataHeadersByPeriod[count] = headers[j].column;
          colors[count] = this.getColor(parseFloat(this.targetInfo[id + '.target']),
              parseFloat(columnData[count]),
              parseFloat(this.targetInfo[id + '.achieved']),
              parseFloat(this.targetInfo[id + '.notInTrack']));
          count ++;
        }
      }
      this.periodDataColors[i] = colors;
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
    console.log('region:', event.value);
  }
  async share() {
    let node = document.getElementById('score_table');
    let nodeString = node.innerHTML;
    nodeString = nodeString.replace('table-responsive data-mobile-responsive', '');
    // node = document.createRange().createContextualFragment(nodeString);
    const doc = new DOMParser().parseFromString(nodeString, 'text/html');
    node = doc.body.querySelector('table');
    console.log(nodeString);
    console.log(doc);
    console.log(node);
    const options: IWriteOptions = { replace: true};
    htmlToImage.toBlob(node).then(async (dataUrl) => {
      this.htmlToImage = dataUrl;
      await this.file.writeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png', this.htmlToImage , options ).then(async result => {
          await this.socialSharing.shareViaFacebook(null, `${this.file.dataDirectory}/files/malariaSc_table.png`, null)
              .then(async o => {
              }).catch(e => {});
        });
    });
  }
  // async chargingImage(content: any) {
  //   const options: IWriteOptions = { replace: true};
  //   await this.file.writeFile(`${this.file.dataDirectory}/files`, 'malariaImage.png', content, options ).then(result => {
  //   });
  // }
 async shareAll() {
    const node = document.getElementById('score_table');
    const option: IWriteOptions = { replace: true};
    const options = {
     message: 'share this message test',
     subject: 'score card',
     files: `${this.file.dataDirectory}/files/malariaSc_table.png`,
     url: 'https://dhis2.jsi.com/dhis',
     chooserTitle: null };
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png', this.htmlToImage, option).then(async r => {
            await this.socialSharing.shareWithOptions(options).then(rt => {
            }).catch(e => {});
           // await this.socialSharing.shareViaFacebook(null, `${this.file.dataDirectory}/files/malariaSc_table.png`, null)
           //      .then(async o => {
           //      }).catch(e => {});
          });
        });
  }

  shareViaFacebool() {
    const node = document.getElementById('score_table');
    const option: IWriteOptions = { replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png', this.htmlToImage, option).then(async r => {
            await this.socialSharing.shareViaFacebook(null, `${this.file.dataDirectory}/files/malariaSc_table.png`, null)
                 .then(async o => {
                 }).catch(e => {});
          });
        });
  }

  shareViaGmail() {
    // const node = document.getElementById('score_table');
    // const option: IWriteOptions = { replace: true};
    // htmlToImage.toBlob(node)
    //     .then(async (dataUrl) => {
    //       this.htmlToImage = dataUrl;
    //       await this.file.writeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png', this.htmlToImage, option).then(async r => {
    //         await this.socialSharing.shareViaEmail(null, null, `${this.file.dataDirectory}/files/malariaSc_table.png`, null)
    //             .then(async o => {
    //             }).catch(e => {});
    //       });
    //     });
  }

  shareViaWhatsapp() {
    const node = document.getElementById('score_table');
    const option: IWriteOptions = { replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png', this.htmlToImage, option).then(async r => {
            await this.socialSharing.shareViaWhatsApp(null, `${this.file.dataDirectory}/files/malariaSc_table.png`, null)
                .then(async o => {
                }).catch(e => {});
          });
        });
  }

  shareViaInstagram() {
    const node = document.getElementById('score_table');
    const option: IWriteOptions = { replace: true};
    htmlToImage.toBlob(node)
        .then(async (dataUrl) => {
          this.htmlToImage = dataUrl;
          await this.file.writeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png', this.htmlToImage, option).then(async r => {
            await this.socialSharing.shareViaInstagram(null, `${this.file.dataDirectory}/files/malariaSc_table.png`)
                .then(async o => {
                }).catch(e => {});
          });
        });

  }
}
