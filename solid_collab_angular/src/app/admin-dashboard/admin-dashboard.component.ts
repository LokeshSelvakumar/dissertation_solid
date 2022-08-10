import { Component, Input, OnInit } from '@angular/core';
import { AjaxResult, Months, ShortAnswers, checkBoxTask } from '../model/constants';
import { FormBuilder } from '@angular/forms';
import { AuthserviceService } from '../authservice.service';
import { getSolidDataset, getThing, SolidDataset } from '@inrupt/solid-client';
import { companyRequests } from '../model/constants';
import { Observable } from 'rxjs';
import { collection, doc, setDoc, Firestore, getDoc } from '@angular/fire/firestore';
import { ActivatedRoute, Params } from '@angular/router';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  dbFire: any;
  screenName = "ADMIN DASHBOARD";
  copysession = this.service.session;
  profName: string = "from admin screen";
  dateSelected: any = Date.now();
  editable: string = "Edit fields";
  enabled_flag: boolean = true;
  loadingSpinner: boolean = true;
  policiesLength: number = 0;
  upvotes: number = 0;
  downVotes: number = 0;
  status: any = "Review";
  months: Months[] = [
    { value: 1, viewValue: 'one' },
    { value: 2, viewValue: 'two' },
    { value: 3, viewValue: 'three' },
  ];
  selectedMonth: number = 1;
  allComplete: boolean = false;
  shortAnswers: ShortAnswers[] = [
    { value: true, viewValue: "yes" },
    { value: false, viewValue: "no" }
  ];
  yesOrNo: boolean = false;
  historyOfData: boolean = false;
  dataSelling: boolean = false;

  dataAccessPurpose = this._formBuilder.group({
    Research: false,
    Analysis: false,
  });

  task: checkBoxTask = {
    name: 'Select All',
    completed: false,
    subtasks: [
      { name: 'Research', completed: false },
      { name: 'Analysis', completed: false },
      // {name: 'Warn', completed: false}
    ]
  };

  timeVoteComponentInputs: any[] = [20, 15];
  purposeVoteComponentInputs: any[] = [20, 15];
  copyVoteComp: any[] = [20, 15];
  historyVoteCom: any[] = [20, 15];
  sellVoteComp: any[] = [20, 15];
  selectedPolicy: any;
  buttondisable = false;
  fromPage = "";
  showDiv = true;
  // on selecting the policy all the fields on right should be updated here
  triggerParamLoad(selectedVal: any) {
    console.log("inside trigger param load");
    console.log(selectedVal);
    this.selectedPolicy = selectedVal;
    let fieldsToUpdate = this.service.updateFields(selectedVal);
    this.updateFieldsInPage(fieldsToUpdate);
  }
  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
    console.log(this.task.subtasks);
  }
  edit() {
    this.enabled_flag = !this.enabled_flag;
    if (!this.enabled_flag) {
      this.editable = "Disable fields";
    }
    else {
      this.editable = "Edit fields";
    }
  }

  async updatefireDB() {
    const docRef = doc(this.store, "solidcollab", "policies");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      this.dbFire = docSnap.data();
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }
  async accept() {
    await setDoc(doc(this.store, "solidcollab", "policies"), {
      request: { [this.selectedPolicy]: { status: "Accepted" } }
    }, { merge: true });
    await this.updatefireDB();
    this.buttondisable = true;
    this.enabled_flag = true;
    this.editable = "Edit fields";
    this.status = "Accepted";
  }
  async reject() {
    await setDoc(doc(this.store, "solidcollab", "policies"), {
      request: { [this.selectedPolicy]: { status: "Rejected" } }
    }, { merge: true });
    await this.updatefireDB();
    this.buttondisable = true;
    this.enabled_flag = true;
    this.editable = "Edit fields";
    this.status = "Rejected";
  }
  async resubmit() {
    await setDoc(doc(this.store, "solidcollab", "policies"), {
      request: { [this.selectedPolicy]: { status: "Resubmit" } }
    }, { merge: true });
    await this.updatefireDB();
    this.buttondisable = true;
    this.enabled_flag = true;
    this.editable = "Edit fields";
    this.status = "Resubmit";

  }
  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
    console.log(this.task.subtasks);
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => (t.completed = completed));
    console.log(this.task.subtasks);
  }
  typesOfShoes: string[] = ['request 1', 'request 2'];
  constructor(private _formBuilder: FormBuilder, private service: AuthserviceService,
    private store: Firestore, private paramroute: ActivatedRoute) {
    paramroute.queryParams.subscribe((params: Params) => {
      console.log("inside constructor of router params");
      console.log(params['message']);
      this.fromPage = params['message'];
    });
    if(this.fromPage == "fromcmpD"){
      this.screenName = "Request Review Page";
      this.showDiv = false;
    }else{
      this.showDiv = true;
    }
  }

  async compdec(statusTOUpdate:string){
    await setDoc(doc(this.store, "solidcollab", "policies"), {
      request: { [this.selectedPolicy]: { status: statusTOUpdate } }
    }, { merge: true });
    await this.updatefireDB();
    this.status = statusTOUpdate;
  }
  async ngOnInit(): Promise<void> {
    const docRef = doc(this.store, "solidcollab", "policies");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      this.dbFire = docSnap.data();
    } else {
      // doc.data() will be undefined in this case
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
    this.status = this.dbFire['request'][fieldsReceived]['status'];
    if (this.status != "Review") {
      this.buttondisable = true;
    }
    else {
      this.buttondisable = false;
    }
    return [upvote, downvote];
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
    this.upvotes = fieldsToUpdate['upvote'];
    this.downVotes = fieldsToUpdate['downvote'];
    this.timeVoteComponentInputs = this.extractVoteInputs(fieldsToUpdate['policy'], "timeVoteParams");
    this.copyVoteComp = this.extractVoteInputs(fieldsToUpdate['policy'], "copyvote");
    this.historyVoteCom = this.extractVoteInputs(fieldsToUpdate['policy'], "historyvote");
    this.sellVoteComp = this.extractVoteInputs(fieldsToUpdate['policy'], "sellvote");
    this.purposeVoteComponentInputs = this.extractVoteInputs(fieldsToUpdate['policy'], "purposeVoteAttr");
  }

}

