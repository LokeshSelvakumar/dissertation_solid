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
  policiesLength: number = 0;
  loadingSpinner:boolean = true;
  profName: string = "from user dashboard";
  upvoteValue = 2;
  downvoteValue = 2;
  upvotesDisabled = false;
  downvotesDisabled = false;
  companyRequestText: string = "1.patient Data access till 13-07-2022\n2.patient Data will be copied\n" +
    "3.history of data collected will be maintained\n4.Patient data will be sold to third parties\n5.Patient data will be used for following purposes:Research, Analysis";
  typesOfShoes: string[] = ['request 1', 'request 2', 'request 3', 'request 4', 'request 5', 'request 6', 'request 7', 'request 8', 'request 9', 'request 10'];

  increment() {
    if(!this.upvotesDisabled && !this.downvotesDisabled){
      this.upvoteValue++;
    }
    else{
      this.upvoteValue++;
      this.downvoteValue--;
    }
    this.upvotesDisabled = true;
    this.downvotesDisabled = false;
  }

  decrement() {
    if(!this.upvotesDisabled && !this.downvotesDisabled){
      this.downvoteValue++;
    }
    else{
      this.downvoteValue++;
      this.upvoteValue--;
    }
    this.downvotesDisabled = true;
    this.upvotesDisabled = false;
  }
  logout() {
    this.service.session = new Session();
    this.service.session.logout();
    this.router.navigate(['/']);
  }

  triggerParamLoad(selectedVal: any) {
    console.log("inside trigger param load");
    console.log(selectedVal);
    let fieldsToUpdate = this.service.updateFields(selectedVal);
    this.updateFieldsInPage(fieldsToUpdate);
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
    (await this.service.getAllCompanyRequests()).subscribe((result) => {
      console.log("result object");
      console.log(result);
      let policies = getThing(result, "https://solid-pcrv.inrupt.net/private/Requests/companyRequests.ttl#http://example.com/companyrequests")
      console.log("policies object");
      console.log(policies);
      this.service.allcompanyRequestsDataset = result;
      let localNamedNodes: any = policies!.predicates['http://example.com/requests']['namedNodes'];
      let localarrayrequests: any = [];
      let tempspinnerValue = true;
      //to get policy names
      this.policiesLength = localNamedNodes.length;
      if (this.policiesLength > 0) {
        localNamedNodes.forEach(function (value: string) {
          console.log(value);
          let splitArray = value.split("#");
          localarrayrequests.push(splitArray[2]);
          tempspinnerValue = false;
        });
        // adding fields on the right side of the page
        let fieldsToUpdate = this.service.updateFields(localarrayrequests[0]);
        this.updateFieldsInPage(fieldsToUpdate);

      }
      this.loadingSpinner = tempspinnerValue;
      this.typesOfShoes = localarrayrequests;
    });
  }

  updateFieldsInPage(fieldsToUpdate: any) {
    let copyText = fieldsToUpdate['yesOrNo']?"be copied":"not be copied";
    let historyText = fieldsToUpdate['history']?"be maintained":"not be maintained";
    let datasellingText = fieldsToUpdate['dataselling']?"be sold to third parties":"not be sold to third parties";
    let researchText = fieldsToUpdate['research']?"Research":"";
    let analysisText = fieldsToUpdate['analysis'] && fieldsToUpdate['research']?", Analysis":fieldsToUpdate['analysis']?"Analysis":"";
    this.upvoteValue = fieldsToUpdate['upvote'];
    this.downvoteValue = fieldsToUpdate['downvote'];
    this.companyRequestText = "1.patient Data access till " + fieldsToUpdate['date'] + "\n2.patient Data will "+historyText+
    "\n3.history of data collected "+historyText+"\n4.Patient data will "+datasellingText+"\n5.Patient data will be used for following purposes:"+researchText+analysisText ;
  }
}

