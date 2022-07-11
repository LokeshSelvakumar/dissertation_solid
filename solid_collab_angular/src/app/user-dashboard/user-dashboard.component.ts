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
  voteValue = 2;
  companyRequestText :string = "placeholder text";
  typesOfShoes: string[] = ['request 1', 'request 2', 'request 3', 'request 4', 'request 5','request 6','request 7','request 8','request 9','request 10'];

  increment() {
    this.voteValue++;
  }

  decrement() {
    this.voteValue--;
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

