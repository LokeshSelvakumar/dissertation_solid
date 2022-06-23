import { Injectable, OnInit } from '@angular/core';
import { Session } from '@inrupt/solid-client-authn-browser';
import { User } from './model/user-info';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService implements OnInit {
  
  private REST_API_SERVICE = "http://localhost:3000";
  constructor(private httpcl:HttpClient){}
  session:Session = new Session();
  loggedUser = null;


   async sendLoginRequest(){
    return await this.httpcl.get(this.REST_API_SERVICE+"/login", {responseType: 'text'});
  }

  async registerUser(user:User){
    return await this.httpcl.post(this.REST_API_SERVICE+"/registerUser",user,{responseType:"text"});
  }

  async checkUser(webId: string) {
    return await this.httpcl.get(this.REST_API_SERVICE+"/checkUser", {responseType: 'text'});
  }
   ngOnInit(): void{
  }

}

