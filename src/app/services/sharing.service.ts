import {Injectable} from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {File, IWriteOptions} from '@ionic-native/file/ngx';
import htmlToImage from 'html-to-image'

@Injectable({
    providedIn: 'root'
})
export class SharingService {
    text = 'aaaa';
    url = 'http://dhis2.jsi.com';
    htmlToImage: any = {};

    constructor(private socialSharing: SocialSharing, private file: File) {
    }
    async resolveLocalFile() {
        return this.file.copyFile(`${this.file.dataDirectory}www.assets.images`,
            'malariaSc_logo.png', this.file.cacheDirectory, `${new Date().getTime()}.png`);
    }

    async saveInLocalFile() {
        return this.file.createFile(`${this.file.applicationStorageDirectory}www.assets.images`, 'table.png', true);
    }
}
