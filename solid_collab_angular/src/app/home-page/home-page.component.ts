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

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor(private router:Router,private service:AuthserviceService) { }
  copysession = this.service.session;
  profName:string = "";

  logout(){
    this.service.session = new Session();
    this.router.navigate(['/']);
  }

  async ngOnInit(): Promise<void> {
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
    console.log(profileDocumentUrl);
    console.log(myDataset);
  }

}
