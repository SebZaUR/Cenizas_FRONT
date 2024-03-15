import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';



@Component({
  selector: 'app-loggin',
  templateUrl: './loggin.component.html',
  styleUrls: ['./loggin.component.css']
})
export class LogginComponent {
  constructor( private msalService: MsalService){

  }

  login(){
    this.msalService.loginPopup().subscribe((response : AuthenticationResult) =>{
      this.msalService.instance.setActiveAccount(response.account);
    })
  }
  
  logut(){
    this.msalService.logout;
  }

  isLog(): boolean{
    return this.msalService.instance.getActiveAccount() != null;
  }
}
