import {Injectable} from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {File} from '@ionic-native/file/ngx';

@Injectable({
    providedIn: 'root'
})
export class SharingService {
    text = 'aaaa';
    url = 'http://dhis2.jsi.com';
    constructor(private socialSharing: SocialSharing, private file: File) {}
     shareTwitter() {
       // const file = await this.resolveLocalFile();
        this.socialSharing.shareViaTwitter(this.text, `${this.file.dataDirectory}/files/malariaSc_table.png`, this.url)
            .then(() => {
                this.file.removeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png').then(() => {});
        }).catch(e => {});
    }
    async resolveLocalFile() {
        return this.file.copyFile(`${this.file.dataDirectory}www.assets.images`,
            'malariaSc_logo.png', this.file.cacheDirectory, `${new Date().getTime()}.png`);
    }
    async saveInLocalFile() {
        return this.file.createFile(`${this.file.applicationStorageDirectory}www.assets.images`, 'table.png', true);
    }

    shareWatsApp() {
        this.socialSharing.shareViaWhatsApp(null, `${this.file.dataDirectory}/files/malariaSc_table.png`, this.url)
            .then( () => {
                this.file.removeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png').then(() => {});
            }).catch(e => {});
    }

    sharedAll() {
        const options = {
          message: 'share this message test',
          subject: 'score card',
          file: `${this.file.dataDirectory}/files/malariaSc_table.png`,
          url: 'https://dhis2.jsi.com/dhis',
          chooserTitle: null,
        };
        this.socialSharing.shareWithOptions(options).then(rt => {
            this.file.removeFile(`${this.file.dataDirectory}/files`, 'malariaSc_table.png').then(() => {});
        }).catch(e => {});
    }
}

