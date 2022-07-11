import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@inrupt/solid-client-authn-browser';
import { AuthserviceService } from 'src/app/authservice.service';

@Component({
  selector: 'app-profile-component',
  templateUrl: './profile-component.component.html',
  styleUrls: ['./profile-component.component.css']
})
export class ProfileComponentComponent implements OnInit {

  constructor(private router: Router, private service: AuthserviceService) { }
  @Input() profName:string = "";

  logout() {
    this.service.session = new Session();
    this.service.session.logout();
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
  }

}
