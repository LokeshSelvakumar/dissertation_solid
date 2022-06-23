import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Session } from "@inrupt/solid-client-authn-browser";
import { AuthserviceService } from '../authservice.service';
import {
  getSolidDataset,
  getThing,
  setThing,
  getStringNoLocale,
  setStringNoLocale,
  saveSolidDatasetAt
} from "@inrupt/solid-client";
import { Observable, windowWhen } from 'rxjs';
import {FormControl} from '@angular/forms';
import { User } from '../model/user-info';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
  constructor(private route: Router,private service:AuthserviceService) {
  }
  fontStyleControl = new FormControl('');
  SOLID_IDENTITY_PROVIDER?: string = "https://inrupt.net";
  session = new Session();
  text_login: String = "";
  userFound = false;

  async login(): Promise<void> {
    console.log("inside login")
    console.log(this.session.info.sessionId);
    localStorage.setItem("signup","false");
      await this.session.login({
        oidcIssuer: this.SOLID_IDENTITY_PROVIDER,
        clientName: "SOLID PCRV",
        redirectUrl: window.location.href
      });
    //   await (await this.service.sendLoginRequest()).subscribe(result=>{
    //     console.log("returned response");
    //     console.log(result);
    //     window.location.href = result;
    //  });
  }

  async signUP():Promise<void>{
    localStorage.setItem("signup","true");
    await this.session.login({
      oidcIssuer: this.SOLID_IDENTITY_PROVIDER,
      clientName: "SOLID PCRV",
      redirectUrl: window.location.href
    });
  }

  async ngOnInit(): Promise<void> {
    await this.session.handleIncomingRedirect({url:window.location.href});
    // let myAppProfile = await getSolidDataset(this.session.info.webId + "/user");
    let webId = this.session.info.webId? this.session.info.webId:"";
     let userLogged:User = new User(webId,"USER");
    //signup logic
    if(localStorage.getItem("signup") =="true"){
      // resetting back local storage
      localStorage.setItem("signup","false");
       (await this.service.registerUser(userLogged)).subscribe((result)=>{
        console.log("after registration");
        console.log(JSON.stringify(result));
        if(result == "usernotfound"){
         this.route.navigate(['/homepage']);
        }
        else{
          console.log("user found already");
        }
      });
    }

    // login logic
    else {
      (await this.service.checkUser(webId)).subscribe((result)=>{

      });
      if (this.session.info.isLoggedIn) {
      // resetting back local storage
      localStorage.setItem("signup","false");
      this.route.navigate(['/homepage']);
    }
  }
  }

  ngOnDestroy(): void {
    this.service.session = this.session;
  }

}
