import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyDashboardComponent } from './company-dashboard/company-dashboard.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginComponent } from './login/login.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

const routes: Routes = [
  // { path: '', component: LoginComponent },
  // { path: 'homepage', component: HomePageComponent },
  // { path: 'userDashboard', component: UserDashboardComponent },
  // {path: 'companyDashboard', component: CompanyDashboardComponent },
// for dev purposes
  { path: '', component: CompanyDashboardComponent }, 


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
