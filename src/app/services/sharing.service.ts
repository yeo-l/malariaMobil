import {Injectable} from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {File} from '@ionic-native/file/ngx';
import {error} from 'util';

@Injectable({
    providedIn: 'root'
})
export class SharingService {
    text = 'aaaa';
    url = 'http://ionicAcademy.com'
    constructor(private socialSharing: SocialSharing, private file: File) {
    }

     shareTwitter() {
       // const file = await this.resolveLocalFile();
        this.socialSharing.shareViaTwitter(this.text, `${this.file.applicationDirectory}www.assets.images.malariaSc_logo.png`)
            .then(() => {

        }).catch(e => {});
    }
    async resolveLocalFile() {
        return this.file.copyFile(`${this.file.applicationDirectory}www.assets.images`,
            'malariaSc_logo.png', this.file.cacheDirectory, `${new Date().getTime()}.png`);
    }
    async saveInLocalFile() {
    }
    async removeLocalFile() {
    }

    shareWhatsApp() {}
    share() {
        this.socialSharing.share(null, this.text,`${this.file.applicationDirectory}www.assets.images/malariaSc_logo.png`, this.url)
            .then(() => {
            }).catch(e => {});
    }
}

