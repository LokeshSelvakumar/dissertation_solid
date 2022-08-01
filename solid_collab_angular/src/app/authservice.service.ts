import { Injectable, OnInit } from '@angular/core';
import { Session } from '@inrupt/solid-client-authn-browser';
import { User } from './model/user-info';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DataAccessRequest } from './model/data-access-request';
import { SolidDataset, getThing } from '@inrupt/solid-client';
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

  updateFields(selectedpolicy: string): any {
    let fieldsToReturn = { 'upvote': 0, 'downvote': 0, 'yesOrNo': false, 'history': false, "dataselling": false, 'research': false, 'analysis': false, 'date': new Date() };
    let displayPolicy = getThing(this.allcompanyRequestsDataset,
      "https://solid-pcrv.inrupt.net/private/Requests/companyRequests.ttl#http://example.com#" + selectedpolicy)
    console.log("displaypolicyyyyyyy")
    console.log(displayPolicy);
    let upvote =
      displayPolicy?.predicates['http://schema.org/upvoteCount']['literals']?.['http://www.w3.org/2001/XMLSchema#integer']?.[0];
    let downvote =
      displayPolicy?.predicates['http://schema.org/downvoteCount']['literals']?.['http://www.w3.org/2001/XMLSchema#integer']?.[0];
    if (upvote) {
      fieldsToReturn['upvote'] = +upvote;
    }
    if (downvote) {
      fieldsToReturn['downvote'] = +downvote;
    }
    let permission_url = displayPolicy?.predicates['http://www.w3.org/ns/odrl/2/Permission']['namedNodes']?.[0];
    permission_url = permission_url ? permission_url : "";
    let permissionThing = getThing(this.allcompanyRequestsDataset, permission_url);
    console.log("permissionThing");
    console.log(permissionThing);
    let actionitemsArray = permissionThing?.predicates['http://www.w3.org/ns/odrl/2/action']['namedNodes'];
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
    let purposeThing, timeConstraintThing;
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
      }
      else if (constraintThing?.predicates['http://www.w3.org/ns/odrl/2/leftOperand']['namedNodes']?.[0] == "http://www.w3.org/ns/odrl/2/dateTime") {
        timeConstraintThing = constraintThing?.predicates['http://www.w3.org/ns/odrl/2/rightOperand']?.['literals']?.['http://www.w3.org/2001/XMLSchema#date'][0];
        if (timeConstraintThing) {
          fieldsToReturn['date'] = new Date(timeConstraintThing);
        }

      }
    });
    return fieldsToReturn;
  }

  ngOnInit(): void {
  }

}

