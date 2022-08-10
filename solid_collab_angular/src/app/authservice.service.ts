import { Injectable, OnInit } from '@angular/core';
import { Session } from '@inrupt/solid-client-authn-browser';
import { User } from './model/user-info';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DataAccessRequest } from './model/data-access-request';
import { SolidDataset, getThing, ThingPersisted } from '@inrupt/solid-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService implements OnInit {

  private REST_API_SERVICE = "http://localhost:3000";
  constructor(private httpcl: HttpClient) { }
  session: Session = new Session();
  //global variable for policies or all submitted requests
  allcompanyRequestsDataset: any;
  userLoggedIn: any;
  selectedPolicy:any;
  policycount:any;

  async sendLoginRequest() {
    return await this.httpcl.get(this.REST_API_SERVICE + "/login", { responseType: 'json' });
  }

  async registerUser(user: User) {
    return await this.httpcl.post(this.REST_API_SERVICE + "/registerUser", user, { responseType: "json" });
  }

  async checkUser(user: User) {
    return await this.httpcl.post(this.REST_API_SERVICE + "/userLogin", user, { responseType: 'json' });
  }

  async DARRequest(DAR: DataAccessRequest) {
    return await this.httpcl.post(this.REST_API_SERVICE + "/submitCompanyRequest", DAR, { responseType: "json" });
  }

  async getAllCompanyRequests() {
    return await this.httpcl.post<SolidDataset>(this.REST_API_SERVICE + "/allCompanyRequests", null, { responseType: "json" });
  }

  // async updateVotes(){
  //    await this.httpcl.post(this.REST_API_SERVICE+"/updateVotes",voteArray,{ responseType: "json" });
  //    this.allcompanyRequestsDataset = this.getAllCompanyRequests();
  // }

  updateFields(selectedpolicy: string): any {
    let fieldsToReturn = {'assigner':"empty" ,'policy':selectedpolicy,'purposeVoteAttr': [0, 0, false, ""], 'timeVoteParams': [0, 0, false, ""], 'upvote': 0, 'downvote': 0, 'yesOrNo': false, 'history': false, "dataselling": false, 'research': false, 'analysis': false, 'date': new Date() };
    let displayPolicy = getThing(this.allcompanyRequestsDataset,
      "https://solid-pcrv.inrupt.net/private/Requests/companyRequests.ttl#http://example.com#" + selectedpolicy)
    console.log("displaypolicyyyyyyy")
    console.log(displayPolicy);
    let permission_url = displayPolicy?.predicates['http://www.w3.org/ns/odrl/2/Permission']['namedNodes']?.[0];
    permission_url = permission_url ? permission_url : "";
    let permissionThing = getThing(this.allcompanyRequestsDataset, permission_url);
    console.log("permissionThing");
    console.log(permissionThing);
    let actionitemsArray = permissionThing?.predicates['http://www.w3.org/ns/odrl/2/action']['namedNodes'];
    let assigner =  permissionThing?.predicates['http://www.w3.org/ns/odrl/2/assigner']['namedNodes']?.[0]?  permissionThing?.predicates['http://www.w3.org/ns/odrl/2/assigner']['namedNodes']?.[0]: "";
    fieldsToReturn['assigner'] =  assigner;
    //assinging the three actions
    if (actionitemsArray?.indexOf("https://w3id.org/oac/Copy") != -1) {
      fieldsToReturn['yesOrNo'] = true;
    }
    if (actionitemsArray?.indexOf("https://w3id.org/oac/Record") != -1) {
      fieldsToReturn['history'] = true;
    }
    if (actionitemsArray?.indexOf("https://w3id.org/oac/sell") != -1) {
      fieldsToReturn['dataselling'] = true;
    }
    //assigning the purpose
    let constraint_url = permissionThing?.predicates['http://www.w3.org/ns/odrl/2/constraint']['namedNodes']?.[0];
    constraint_url = constraint_url ? constraint_url : "";
    let constraintThing = getThing(this.allcompanyRequestsDataset, constraint_url);
    let constraintArray = constraintThing?.predicates['http://www.w3.org/ns/odrl/2/and']['namedNodes'];
    let purposeThing, timeConstraintThing, purposeVoteThing;
    constraintArray?.forEach((value: any) => {
      constraintThing = getThing(this.allcompanyRequestsDataset, value);
      if (constraintThing?.predicates['http://www.w3.org/ns/odrl/2/leftOperand']['namedNodes']?.[0] == "https://w3id.org/oac/Purpose") {
        purposeThing = constraintThing?.predicates['http://www.w3.org/ns/odrl/2/rightOperand']?.['namedNodes'];
        if (purposeThing) {
          purposeThing.forEach((value: any) => {
            if (value == "https://w3id.org/dpv#ResearchAndDevelopment") {
              fieldsToReturn['research'] = true;
            }
            else if (value == "https://w3id.org/dpv#ServiceUsageAnalytics") {
              fieldsToReturn['analysis'] = true;
            }
          });
        }
        //purpose vote thing;
        fieldsToReturn['purposeVoteAttr'] = this.unveilVoteParams(constraintThing);
      }
      else if (constraintThing?.predicates['http://www.w3.org/ns/odrl/2/leftOperand']['namedNodes']?.[0] == "http://www.w3.org/ns/odrl/2/dateTime") {
        timeConstraintThing = constraintThing?.predicates['http://www.w3.org/ns/odrl/2/rightOperand']?.['literals']?.['http://www.w3.org/2001/XMLSchema#date'][0];
        if (timeConstraintThing) {
          fieldsToReturn['date'] = new Date(timeConstraintThing);
        }
        fieldsToReturn['timeVoteParams'] = this.unveilVoteParams(constraintThing);
      }
    });
    return fieldsToReturn;
  }

  unveilVoteParams(constraintThing: ThingPersisted) {
    let purposeVoteThing;
    let purposeVoteThing_url: any = constraintThing?.predicates['http://www.w3.org/2002/07/owl#Thing']['namedNodes']?.[0];
    console.log(purposeVoteThing_url);
    purposeVoteThing = getThing(this.allcompanyRequestsDataset, purposeVoteThing_url);
    console.log("purposeVOTETHING");
    console.log(purposeVoteThing);
    let purposeUPVote = purposeVoteThing?.predicates['http://schema.org/upvoteCount']?.['literals']?.['http://www.w3.org/2001/XMLSchema#integer'][0];
    purposeUPVote = purposeUPVote ? purposeUPVote : '0';
    let purposedownVote = purposeVoteThing?.predicates['http://schema.org/downvoteCount']?.['literals']?.['http://www.w3.org/2001/XMLSchema#integer'][0];
    purposedownVote = purposeUPVote ? purposeUPVote : '0';
    let votedGroupThing_url = purposeVoteThing?.predicates['http://d-nb.info/standards/elementset/gnd#GroupOfPersons']['namedNodes']?.[0];
    votedGroupThing_url = votedGroupThing_url ? votedGroupThing_url : "";
    let votedGroupThing = getThing(this.allcompanyRequestsDataset, votedGroupThing_url);
    console.log(votedGroupThing);
    let voteDecision: any, isPresent;
    if (votedGroupThing?.predicates[this.userLoggedIn]) {
      isPresent = true;
      voteDecision = votedGroupThing?.predicates[this.userLoggedIn]['literals']?.['http://www.w3.org/2001/XMLSchema#string']?.[0];
      voteDecision = voteDecision ? voteDecision : "";
    }
    else {
      isPresent = false;
    }
    return [parseInt(purposeUPVote), parseInt(purposedownVote), isPresent, voteDecision];
  }

  ngOnInit(): void {
  }

}

