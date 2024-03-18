import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';



@Component({
  selector: 'app-loggin',
  templateUrl: './loggin.component.html',
  styleUrls: ['./loggin.component.css']
})
export class LogginComponent {
  title = 'msal-angular-tutorial';
  isIframe = false;
  loginDisplay = false;

  constructor(private msalService: MsalService) { }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
  }

  login() {
    this.msalService.loginPopup()
      .subscribe({
        next: (result) => {
          console.log(result);
        },
        error: (error) => console.log(error)
      });
  }
  
  logut(){
    this.msalService.logout;
  }

  isLog(): boolean{
    return this.msalService.instance.getActiveAccount() != null;
  }
}
