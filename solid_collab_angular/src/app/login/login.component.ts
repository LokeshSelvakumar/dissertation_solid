import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Session } from "@inrupt/solid-client-authn-browser";
import { AuthserviceService } from '../authservice.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
  constructor(private route: Router,private service:AuthserviceService) {
  }
  session = new Session();
  text_login: String = "";
  async login(): Promise<void> {
    console.log("inside login")
    console.log(this.session.info.sessionId);
    const SOLID_IDENTITY_PROVIDER = "https://inrupt.net";

    if (!this.session.info.isLoggedIn) {
      localStorage.setItem("solidSess",JSON.stringify(this.session));
     
      await this.session.login({
        oidcIssuer: SOLID_IDENTITY_PROVIDER,
        clientName: "Inrupt tutorial client app",
        redirectUrl: window.location.href
      });
    }
  }

  async ngOnInit(): Promise<void> {
    await this.session.handleIncomingRedirect(window.location.href);
    // localStorage.setItem("solidSession",JSON.stringify(this.session));
    if (this.session.info.isLoggedIn) {
      this.route.navigate(['/homepage']);
    }
  }

  ngOnDestroy(): void {
    this.service.session = this.session;
  }

}
