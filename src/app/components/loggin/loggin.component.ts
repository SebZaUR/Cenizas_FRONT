import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { user } from 'src/app/JsonType/user';
import { UserService } from 'src/app/services/user/user.service';



@Component({
  selector: 'app-loggin',
  templateUrl: './loggin.component.html',
  styleUrls: ['./loggin.component.css']
})
export class LogginComponent implements OnInit, OnDestroy{
  title = 'msal-angular-tutorial';
  isIframe = false;
  loginDisplay = false;
  mail : string = "";
  nickname : string = "";
  usuario : user | undefined;
  private readonly _destroying$ = new Subject<void>();
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.msalService.instance.getAllAccounts().length > 0;
  }

  login() {
    this.msalService.loginPopup()
      .subscribe({
        next: (result: AuthenticationResult) => {
          if (result.account && result.account.name && result.account.username) {
            this.mail = result.account.username;
            this.userService.startSession(this.mail).subscribe((resultado => {
              console.log("Se inicio sesion");
            }));
          }
        },
        error: (error) => console.log(error)
      });
  }

  createCount(){
    this.msalService.loginPopup()
      .subscribe({
        next: (result: AuthenticationResult) => {
          if (result.account && result.account.name && result.account.username) {
            this.nickname = result.account.username;
            this.mail = result.account.name;
            this.userService.createUser(this.mail,this.nickname).subscribe((resultado => {
              console.log("Se inicio sesion");
            }));
          }
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
  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}