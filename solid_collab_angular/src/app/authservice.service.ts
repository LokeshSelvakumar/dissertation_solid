import { Injectable, OnInit } from '@angular/core';
import { Session } from '@inrupt/solid-client-authn-browser';
import { user } from './user-info';


@Injectable({
  providedIn: 'root'
})
export class AuthserviceService implements OnInit {
  constructor(){}
  session:Session = new Session();
  loggedUser= null;

   ngOnInit(): void{
  }

}

