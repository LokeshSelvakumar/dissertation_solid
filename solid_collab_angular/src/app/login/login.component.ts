import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Session } from "@inrupt/solid-client-authn-browser";
import { AuthserviceService } from '../authservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  getSolidDataset,
  getThing,
  setThing,
  getStringNoLocale,
  setStringNoLocale,
  saveSolidDatasetAt
} from "@inrupt/solid-client";
import { Observable, windowWhen } from 'rxjs';
import { FormControl } from '@angular/forms';
import { User } from '../model/user-info';
import {AjaxResult} from '../model/constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
  constructor(private route: Router, private service: AuthserviceService, private _snackBar: MatSnackBar) {
  }
  SOLID_IDENTITY_PROVIDER?: string = "https://inrupt.net";
  USER_SELECTION: string = "USER";
  session = new Session();

  async login(): Promise<void> {
    console.log("inside login")
    console.log(this.session.info.sessionId);
    localStorage.setItem("signup", "false");
    localStorage.setItem("signupUser", this.USER_SELECTION);
    await this.session.login({
      oidcIssuer: this.SOLID_IDENTITY_PROVIDER,
      clientName: "SOLID PCRV",
      redirectUrl: window.location.href
    });
  }

  async signUP(): Promise<void> {
    localStorage.setItem("signup", "true");
    localStorage.setItem("signupUser", this.USER_SELECTION);
    await this.session.login({
      oidcIssuer: this.SOLID_IDENTITY_PROVIDER,
      clientName: "SOLID PCRV",
      redirectUrl: window.location.href
    });
  }

  async ngOnInit(): Promise<void> {
    //handle incoming redirect from solid identity provider after login
    await this.session.handleIncomingRedirect({ url: window.location.href });

    let webId = this.session.info.webId ? this.session.info.webId : "";
    let userSelection = localStorage.getItem("signupUser");
    let routerparam =  userSelection=="USER"?"/userDashboard": "/companyDashboard";

    if (this.session.info.isLoggedIn) {
      let myAppProfile = await getSolidDataset(this.session.info.webId + "/user");
      let userCard = getThing(
        myAppProfile,
        this.session.info.webId ? this.session.info.webId : "" //will always have some value
      );
      let name = getThing(
        myAppProfile,
        this.session.info.webId ? this.session.info.webId : "" //will always have some value
      );
      let userLogged: User = new User(webId, userSelection ? userSelection : "USER");
      //signup logic
      if (localStorage.getItem("signup") == "true") {
        // resetting back local storage
        localStorage.setItem("signup", "false");
        (await this.service.registerUser(userLogged)).subscribe((result: AjaxResult) => {
          console.log("after registration");

          if (result['message'] == "user Registered") {
            this.route.navigate([routerparam]);
          }
          else {
            this._snackBar.open("user exists already Try logging in", "ok");
            console.log("user exists already cannot register");
          }
        });
      }
      else {// login logic
        (await this.service.checkUser(userLogged)).subscribe((result: AjaxResult) => {
          if (result['message'] == "login success") {
            this.route.navigate([routerparam]);
          }
          else {
            this._snackBar.open("user not found, Try signing in", "ok");
          }
        });
          // resetting back local storage
          localStorage.setItem("signup", "false");
      }
    }
  }

  ngOnDestroy(): void {
    this.service.session = this.session;
  }

}
