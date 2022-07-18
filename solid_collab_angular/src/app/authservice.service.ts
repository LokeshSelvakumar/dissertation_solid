import { Injectable, OnInit } from '@angular/core';
import { Session } from '@inrupt/solid-client-authn-browser';
import { User } from './model/user-info';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DataAccessRequest } from './model/data-access-request';
import { SolidDataset } from '@inrupt/solid-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService implements OnInit {

  private REST_API_SERVICE = "http://localhost:3000";
  constructor(private httpcl: HttpClient) { }
  session: Session = new Session();
  //global variable for policies or all submitted requests
  allcompanyRequests:any;

  async sendLoginRequest() {
    return await this.httpcl.get(this.REST_API_SERVICE + "/login", { responseType: 'json' });
  }

  async registerUser(user: User) {
    return await this.httpcl.post(this.REST_API_SERVICE + "/registerUser", user, { responseType: "json" });
  }

  async checkUser(user: User) {
    return await this.httpcl.post(this.REST_API_SERVICE + "/userLogin", user, { responseType: 'json' });
  }

  async DARRequest(DAR: DataAccessRequest) {
    return await this.httpcl.post(this.REST_API_SERVICE + "/submitCompanyRequest", DAR, { responseType: "json" });
  }

   async getAllCompanyRequests(){
    return await this.httpcl.post<SolidDataset>(this.REST_API_SERVICE + "/allCompanyRequests", null,{responseType:"json"});
  }
  ngOnInit(): void {
  }

}

