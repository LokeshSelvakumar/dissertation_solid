import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@inrupt/solid-client-authn-browser';
import { AuthserviceService } from '../authservice.service';
import { VCARD } from "@inrupt/vocab-common-rdf";
import { collection, doc, getDoc, setDoc, Firestore, increment, updateDoc } from '@angular/fire/firestore';
import {
  getSolidDataset,
  getThing,
  setThing,
  getStringNoLocale,
  setStringNoLocale,
  saveSolidDatasetAt
} from "@inrupt/solid-client";

import { FormBuilder } from '@angular/forms';
import { DataAccessRequest } from '../model/data-access-request';
import { AjaxResult, Months, ShortAnswers, checkBoxTask } from '../model/constants';

// interface Months {
//   value: number;
//   viewValue: string;
// }

// interface ShortAnswers {
//   value: boolean;
//   viewValue: string;
// }

// export interface checkBoxTask {
//   name: string;
//   completed: boolean;
//   subtasks?: checkBoxTask[];
// }

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor(private router: Router, private service: AuthserviceService, private _formBuilder: FormBuilder, private store: Firestore) { }
  copysession = this.service.session;
  profName: string = "from home page";
  dateSelected: number = Date.now();

  months: Months[] = [
    { value: 1, viewValue: 'one' },
    { value: 2, viewValue: 'two' },
    { value: 3, viewValue: 'three' },
  ];
  selectedMonth: number = 1;

  shortAnswers: ShortAnswers[] = [
    { value: true, viewValue: "yes" },
    { value: false, viewValue: "no" }
  ];
  yesOrNo: boolean = true;
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
    ]
  };

  allComplete: boolean = false;

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
    console.log(this.task.subtasks);
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
  logout() {
    this.service.session = new Session();
    this.service.session.logout();
    this.router.navigate(['/']);
  }

  async submit() {
    console.log(this.dateSelected);
    let webId = this.copysession.info.webId || "";
    let DAR: DataAccessRequest = new DataAccessRequest(webId, this.dateSelected, this.yesOrNo, this.task, this.historyOfData, this.dataSelling);

    // await updateDoc(doc())
    (await this.service.DARRequest(DAR)).subscribe(async (result: AjaxResult) => {
      console.log(result);
      console.log("inside result");
      if (result['message'] == "request_submitted") {
        await setDoc(doc(this.store, "solidcollab", "policies"), {
          count: increment(1)
        }, { merge: true });
        this.service.policycount++;
        await setDoc(doc(this.store, "solidcollab", "policies"), {
          request: {
            ["request_" + this.service.policycount]: {
              1: { upvote: 0, downvote: 0, members: [] }, 2: { upvote: 0, downvote: 0, members: [] }, 3: { upvote: 0, downvote: 0, members: [] },
              4: { upvote: 0, downvote: 0, members: [] }, 5: { upvote: 0, downvote: 0, members: [] }, comments: {}, status:"Review",
            }
          }
        }, { merge: true });
        this.router.navigate(["/companyDashboard"], { queryParams: { message: result['message'] } });
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const docRef = doc(this.store, "solidcollab", "policies");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      this.service.policycount = docSnap.data()['count'];
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
  }

}
