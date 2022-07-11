import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthserviceService } from '../authservice.service';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.css']
})
export class CompanyDashboardComponent implements OnInit {

  constructor(private router: Router, private service: AuthserviceService) { }
  profName: string = "from company dashboard";

  logout(){
    
  }

  ngOnInit(): void {
  }

}
