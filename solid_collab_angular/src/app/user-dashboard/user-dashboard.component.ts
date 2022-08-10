import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@inrupt/solid-client-authn-browser';
import { AuthserviceService } from '../authservice.service';
import { checkBoxTask, ShortAnswers } from '../model/constants';
import { collection, doc, setDoc, Firestore, getDoc } from '@angular/fire/firestore';
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

  constructor(private router: Router, private service: AuthserviceService, private store: Firestore) { }

  dbFire: any;
  copysession = this.service.session;
  dateSelected = new Date();
  policiesLength: number = 0;
  loadingSpinner: boolean = true;
  profName: string = "from user dashboard";
  thirdparty:string = "aseGroup";
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
  timeVoteComponentInputs: any[] = [20, 15, false, false, "timeVoteParams", ""];
  purposeVoteComponentInputs: any[] = [212, 223, true, true, "purposeVoteAttr", ""];
  copyVoteComp: any[] = [20, 15, false, false, "copyVoteComp", ""];
  historyVoteCom: any[] = [20, 15, false, false, "historyVoteCom", ""];
  sellVoteComp: any[] = [20, 15, false, false, "sellVoteComp", ""];


  logout() {
    this.service.session = new Session();
    this.service.session.logout();
    this.router.navigate(['/']);
  }

  async triggerParamLoad(selectedVal: any) {
    console.log("inside trigger param load");
    console.log(selectedVal);
    const docRef = doc(this.store, "solidcollab", "policies");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      this.dbFire = await docSnap.data();
    } else {
      console.log("No such document!");
    }
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
    const docRef = doc(this.store, "solidcollab", "policies");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      this.dbFire = docSnap.data();
    } else {
      console.log("No such document!");
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
    this.timeVoteComponentInputs = this.extractVoteInputs(fieldsToUpdate['policy'], "timeVoteParams");
    this.copyVoteComp = this.extractVoteInputs(fieldsToUpdate['policy'], "copyvote");
    this.historyVoteCom = this.extractVoteInputs(fieldsToUpdate['policy'], "historyvote");
    this.sellVoteComp = this.extractVoteInputs(fieldsToUpdate['policy'], "sellvote");
    this.purposeVoteComponentInputs = this.extractVoteInputs(fieldsToUpdate['policy'], "purposeVoteAttr");
    this.thirdparty = fieldsToUpdate['assigner'];

  }

  extractVoteInputs(fieldsReceived: any, componentMapping: string) {
    let disableUp, disableDown;
    let ruleNumber;
    switch (componentMapping) {
      case "timeVoteParams":
        ruleNumber = 1;
        break;
      case "copyvote":
        ruleNumber = 2;
        break;
      case "historyvote":
        ruleNumber = 3;
        break;
      case "sellvote":
        ruleNumber = 4;
        break;
      case "purposeVoteAttr":
        ruleNumber = 5;
        break;
      default:
        ruleNumber = 1;
    }

    let rule = this.dbFire['request'][fieldsReceived][ruleNumber];
    let upvote = rule['upvote'];
    let downvote = rule['downvote'];
    let members = rule['members']
    let isPresent = false;
    let votedOption = "";
    members.forEach((value: any) => {
      if (value[this.profName]) {
        isPresent = true;
        votedOption = value[this.profName];
      }
    });

    if (isPresent == false) {
      disableUp = false;
      disableDown = false;
    }
    else {
      if (votedOption == "upvote") {
        disableUp = true;
        disableDown = false;
      }
      else {
        disableUp = false;
        disableDown = true;
      }
    }
    return [upvote, downvote, disableUp, disableDown, componentMapping, fieldsReceived]
  }
}

