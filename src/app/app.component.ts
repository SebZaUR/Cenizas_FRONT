// Required for Angular
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';

// Required for MSAL
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, RedirectRequest } from '@azure/msal-browser';

// Required for RJXS
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { UserService } from './services/user/user.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProfileType } from './schemas/ProfileTypeJson';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../assets/style/main.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Angular 12 - MSAL Example';
  loginDisplay = false;
  tokenExpiration: string = '';
  private readonly _destroying$ = new Subject<void>();
  profile!: ProfileType;
  user: any;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private userService: UserService, private router: Router,
    private http: HttpClient
  ) { }

  // On initialization of the page, display the page elements based on the user state
  ngOnInit(): void {
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
      this.tokenExpiration = (msg.payload as any).expiresOn;
      localStorage.setItem('tokenExpiration', this.tokenExpiration);
    });
    // Suscribirse al evento de cambio de estado de autenticación
    this.authService.handleRedirectObservable()
      .subscribe({
        next: (response) => {
          // Verificar si el usuario ha iniciado sesión correctamente
          if (response && response.account) {
            // Obtener información del usuario
            const userInfo = response.account.idTokenClaims;

            // Lógica para crear un perfil en la base de datos
            if (userInfo) {
              this.getCount(userInfo);
            }
          }
        },
        error: (error) => {
          console.error('Error durante el inicio de sesión:', error);
        }
      });
  }

  // If the user is logged in, present the user with a "logged in" experience
  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  // Log the user in and redirect them if MSAL provides a redirect URI otherwise go to the default URI
  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  createCount(userInfo: any) {
    this.userService.createUser(userInfo.name, userInfo.preferred_username).subscribe({
      next: (r) => console.log("Cuenta creada en DB"),
      error: (error) => console.log(error),
      complete: () => console.info('Cuenta creada, sesion iniciada')
    });
  }

  getCount(userInfo: any) {
    this.userService.getUser(userInfo.preferred_username).subscribe({
      next: () => console.log("Cuenta Existente en DB"),
      error: () => this.createCount(userInfo),
      complete: () => console.info('Cuenta obtenida, sesion iniciada')
    });
  }

  // Log the user out
  logout() {
    this.authService.logoutRedirect();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
