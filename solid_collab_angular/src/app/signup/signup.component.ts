import { Component, OnInit } from '@angular/core';

interface userType{
value:string;
viewValue:String;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor() { }
  userType: userType[] = [
    {value: 'patient', viewValue: 'patient'},
    {value: 'company', viewValue: 'company'},
  ];

  ngOnInit(): void {
  }

}
