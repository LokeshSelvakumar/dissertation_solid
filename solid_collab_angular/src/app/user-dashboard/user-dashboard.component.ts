import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@inrupt/solid-client-authn-browser';
import { AuthserviceService } from '../authservice.service';
import {
  getSolidDataset,
  getThing,
  setThing,
  getStringNoLocale,
  setStringNoLocale,
  saveSolidDatasetAt
} from "@inrupt/solid-client";

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  constructor(private router: Router, private service: AuthserviceService) { }
  copysession = this.service.session;
  profName: string = "from user dashboard";
  upvoteValue = 2;
  downvoteValue = 2;
  companyRequestText :string = "1.patient Data access till 13-07-2022\n2.patient Data will be copied\n"+
  "3.history of data collected will be maintained\n4.Patient data will be sold to third parties\n5.Patient data will be used for following purposes:Research, Analysis";
  typesOfShoes: string[] = ['request 1', 'request 2', 'request 3', 'request 4', 'request 5','request 6','request 7','request 8','request 9','request 10'];

  increment() {
    this.upvoteValue++;
  }

  decrement() {
    this.downvoteValue++;
  }
  logout() {
    this.service.session = new Session();
    this.service.session.logout();
    this.router.navigate(['/']);
  }

  async ngOnInit(): Promise<void> {
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

