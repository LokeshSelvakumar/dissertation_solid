import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@inrupt/solid-client-authn-browser';
import { AuthserviceService } from '../authservice.service';
import { checkBoxTask, ShortAnswers } from '../model/constants';
import { collection,doc,setDoc,Firestore } from '@angular/fire/firestore';
import {
  getSolidDataset,
  getThing
} from "@inrupt/solid-client";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UserDashboardComponent implements OnInit {

  constructor(private router: Router, private service: AuthserviceService,private store: Firestore) { 
    
  }
   dbFire = collection(this.store,"solidcollab");
  copysession = this.service.session;
  dateSelected = new Date();
  policiesLength: number = 0;
  loadingSpinner: boolean = true;
  profName: string = "from user dashboard";

  dataSelling = false;
  historyOfData = false;
  yesOrNo = false;
  allComplete: boolean = false;
  task: checkBoxTask = {
    name: 'Select All',
    completed: false,
    subtasks: [
      { name: 'Research', completed: false },
      { name: 'Analysis', completed: false },
    ]
  };
  
  shortAnswers: ShortAnswers[] = [
    { value: true, viewValue: "yes" },
    { value: false, viewValue: "no" }
  ];
  typesOfShoes: string[] = [];

  //vote component variables
  timeVoteComponentInputs: any[] = [20, 15, false, false,"timeVoteParams"];
  purposeVoteComponentInputs:any[]=[212,223,true,true,"purposeVoteAttr"];
  

  logout() {
    this.service.session = new Session();
    this.service.session.logout();
    this.router.navigate(['/']);
  }

  triggerParamLoad(selectedVal: any) {
    console.log("inside trigger param load");
    console.log(selectedVal);
    this.service.selectedPolicy = selectedVal;
    let fieldsToUpdate = this.service.updateFields(selectedVal);
    this.updateFieldsInPage(fieldsToUpdate);
  }
  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => (t.completed = completed));
    console.log(this.task.subtasks);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
    console.log(this.task.subtasks);
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
  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
    console.log(this.task.subtasks);
  }

  updateFieldsInPage(fieldsToUpdate: any) {
    this.dateSelected = fieldsToUpdate['date'];
    this.yesOrNo = fieldsToUpdate['yesOrNo'];
    this.dataSelling = fieldsToUpdate['dataselling'];
    this.historyOfData = fieldsToUpdate['history'];
    if (this.task.subtasks?.[0]) {
      this.task.subtasks[0]['completed'] = fieldsToUpdate['research'];
    }
    if (this.task.subtasks?.[1]) {
      this.task.subtasks[1]['completed'] = fieldsToUpdate['analysis'];
    }
    this.timeVoteComponentInputs = this.extractVoteInputs(fieldsToUpdate['timeVoteParams'],"timeVoteParams");
    this.purposeVoteComponentInputs = this.extractVoteInputs(fieldsToUpdate['purposeVoteAttr'],"purposeVoteAttr");

  }

  extractVoteInputs(fieldsReceived: any,componentMapping:string) {
    let disableUp, disableDown;
    if (fieldsReceived[2] == false) {
      disableUp = false;
      disableDown = false;
    }
    else {
      if (fieldsReceived[3] == "upvote") {
        disableUp = true;
        disableDown = false;
      }
      else {
        disableUp = false;
        disableDown = true;
      }
    }
    return [fieldsReceived[0], fieldsReceived[1], disableUp, disableDown,componentMapping]
  }
}

