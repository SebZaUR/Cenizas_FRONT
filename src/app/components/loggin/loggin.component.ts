import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult, InteractionStatus,RedirectRequest } from '@azure/msal-browser';
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
  tokenExpiration: string = '';
  private readonly _destroying$ = new Subject<void>();
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
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
    // Used for storing and displaying token expiration
    this.msalBroadcastService.msalSubject$.pipe(filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS)).subscribe(msg => {
      this.tokenExpiration=  (msg.payload as any).expiresOn;
      localStorage.setItem('tokenExpiration', this.tokenExpiration);
    });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  createCount(){
    this.authService.loginPopup()
      .subscribe({
        next: (result: AuthenticationResult) => {
          if (result.account && result.account.name && result.account.username) {
            this.mail = result.account.username;
            this.nickname = result.account.name;
            this.userService.createUser(this.mail,this.nickname).subscribe((resultado => {
              console.log("Se inicio sesion");
            }));
          }
        },
        error: (error) => console.log(error)
      });
  }
  
  logut(){
    this.authService.logoutRedirect();
  }

  isLog(): boolean{
    return this.authService.instance.getActiveAccount() != null;
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}