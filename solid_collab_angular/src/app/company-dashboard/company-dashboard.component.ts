import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthserviceService } from '../authservice.service';
import {
  getSolidDataset,
  getThing,
  setThing,
  getStringNoLocale,
  setStringNoLocale,
  saveSolidDatasetAt
} from "@inrupt/solid-client";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.css']
})
export class CompanyDashboardComponent implements OnInit {
  fromPage = "";
  constructor(private router: Router, private service: AuthserviceService, private paramroute: ActivatedRoute,private _snackBar: MatSnackBar) {
    paramroute.queryParams.subscribe((params:Params) => {
      console.log("inside constructor of router params");
      console.log(params);
      console.log(params['message']);
      this.fromPage = params['message'];
    });
  }
  profName: string = "from company dashboard";
  copysession = this.service.session;
  redirectNames = ['/homepage', '/adminDashboard'];
  redirect(redirectName: string) {
    console.log(redirectName);
    this.router.navigate([redirectName],{ queryParams: { message: "fromcmpD"} });
  }

  async ngOnInit(): Promise<void> {
    console.log("route rparam");
    console.log(this.fromPage);
    if(this.fromPage == "request_submitted"){
      this._snackBar.open("request submitted","ok");
    }
    await this.copysession.handleIncomingRedirect({ url: window.location.href, restorePreviousSession: true });
    let webId = this.copysession.info.webId || "";
    let profileDocumentUrl = new URL(webId);
    let myDataset;
    if (this.copysession.info.isLoggedIn) {
      myDataset = await getSolidDataset(profileDocumentUrl.href);
    } else {
      myDataset = await getSolidDataset(profileDocumentUrl.href);
    }
    let profile = getThing(myDataset, webId);
    this.profName = profileDocumentUrl.toString();
  }

}
