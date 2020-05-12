import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public authenticated: boolean;
  public token: string;

  constructor(private httpClient: HttpClient) {
  }
  getUrl(url: string, httpOptions) {
    return this.httpClient.get(url, httpOptions);
  }

  private saveToken() {
    this.token = '0KLDKDUDGFMalariaV1hEABI';
    localStorage.setItem('myToken', this.token);
  }
  public loadToken() {
    this.token = localStorage.getItem('myToken');
    if (this.token === '0KLDKDUDGFMalariaV1hEABI' ) {
      this.authenticated = true;
    } else {
      this.authenticated = false;
    }
    return true;
  }
}
