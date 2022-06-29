import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@inrupt/solid-client-authn-browser';
import { AuthserviceService } from '../authservice.service';
import { VCARD } from "@inrupt/vocab-common-rdf";
import {
  getSolidDataset,
  getThing,
  setThing,
  getStringNoLocale,
  setStringNoLocale,
  saveSolidDatasetAt
} from "@inrupt/solid-client";

import {FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor(private router: Router, private service: AuthserviceService,private _formBuilder: FormBuilder) { }
  copysession = this.service.session;
  profName: string = "";

  toppings = this._formBuilder.group({
    pepperoni: false,
    extracheese: false,
    mushroom: false,
  });

  logout() {
    this.service.session = new Session();
    this.service.session.logout();
    this.router.navigate(['/']);
  }
  
  submit(){
    
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
