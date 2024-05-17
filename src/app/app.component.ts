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
import { UserJson } from './schemas/UserJson';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { FriendRequest } from "src/app/schemas/FriendRequest";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Cenizas del pasado';
  socket = io(environment.socketLink);
  loginDisplay = false;
  tokenExpiration: string = '';
  private readonly _destroying$ = new Subject<void>();
  profile!: ProfileType;
  user!: UserJson;
  mail: string | undefined;
  nickname!: string;
  friendMail: string = "";
  sentList: FriendRequest[] = [];
  receivedList: FriendRequest[] = [];
  showError: boolean = false;
  friends: string[] = [];
  newNot: boolean = false;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private userService: UserService, private router: Router,
    private http: HttpClient
  ) { }

  // On initialization of the page, display the page elements based on the user state
  ngOnInit(): void {
    this.socket.connect();
    this.setLoginDisplay();
    if(this.loginDisplay){
      this.socket.on('connect', () => {
        this.http.get('https://graph.microsoft.com/v1.0/me').subscribe(
            (profile: any) => {
                this.profile = profile;
                if (this.profile && this.profile.mail && this.profile.displayName) {
                    this.nickname = this.profile.displayName;
                    const userEmail = this.profile.mail;
                    this.processUserData(userEmail);
                }
            },
            (error: any) => {
                console.error('Error al obtener el perfil del usuario:', error);
            }
        );
    });
    }
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
    this.socket.on('friendRequestReceived', (data) => {
      // Lógica para manejar la solicitud de amistad recibida
      console.log(`El usuario con correo electrónico ${data} te envio una solicitud.`);
      this.newNot = true;
      this.bringFriendRequestReceived(this.user.mail)
    })
    this.socket.on('friendRequestRespond', (data) => {
      // Lógica para manejar la solicitud de amistad recibida
      console.log(`Respuesta ${data}`);
      if (data == 'accepted') {
        this.bringUserFriends(this.user.mail)
      }
      this.bringPendingSendFriendRequest(this.user.mail)
    })
    console.log("En estado auth " + this.loginDisplay)
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
      next: (respond) => {
        console.log("Cuenta creada en DB")
        this.user = respond
        this.processUserData(this.user.mail)
      },
      error: (error) => console.log(error),
      complete: () => console.info('Cuenta creada, sesion iniciada')
    });
  }



  getCount(userInfo: any) {
    this.userService.getUser(userInfo.preferred_username).subscribe({
      next: (respond) => {
        console.log("Cuenta Existente en DB")
        this.user = respond
        this.processUserData(this.user.mail)
      },
      error: () => this.createCount(userInfo),
      complete: () => console.info('Cuenta obtenida, sesion iniciada')
    });
  }



  // Log the user out
  logout() {
    this.authService.logoutRedirect();
  }

  processUserData(userEmail: string): void {
    console.log("Connec socket")
    this.bringUserInfo(userEmail);
    this.socket.emit('registPlayer', { user: userEmail, id: this.socket.id });
    this.bringPendingSendFriendRequest(userEmail);
    this.bringFriendRequestReceived(userEmail);
    this.bringUserFriends(userEmail);
  }


  sendFriendRequest(correo: string) {
    if (correo == this.user.mail) {
      this.showError = true
    } else {
      this.userService.sendFriendRequest(this.user.mail, correo).subscribe({
        next: () => {
          this.socket.emit('sendFriendRequest', ({ send: this.user.mail, reciever: correo }))
          this.showError = false
          this.bringPendingSendFriendRequest(this.user.mail)
        },
        error: (error) => {
          console.error('Error al enviar la solicitud de amistad:', error);
          // Mostrar un mensaje de error al usuario
          this.showError = true
        },
        complete: () => console.info('Send Friend Request complete')
      })
    }
  }

  respondToFriendRequest(correo: string, respond: string) {
    this.userService.respondFriendReques(this.user.mail, correo, respond).subscribe({
      next: () => {
        this.socket.emit('respondRequest', ({ reciever: this.user.mail, send: correo, respond: respond }))
        if (respond == 'accepted') {
          this.bringUserFriends(this.user.mail)
        }
        this.bringFriendRequestReceived(this.user.mail)
      },
      error: (error) => {
        console.error('Error al enviar la solicitud de amistad:', error);
        // Mostrar un mensaje de error al usuario
        this.showError = true
      },
      complete: () => console.info('Respond To FriendRequest complete')
    })

  }

  bringUserFriends(mail: string) {
    this.userService.getUserFriends(mail).subscribe({
      next: (response) => {
        this.friends = response
      },
      error: (error) => console.log(error),
      complete: () => console.info('Traer Amigos completo')
    })
  }

  bringUserInfo(mail: string) {
    this.userService.getUser(mail).subscribe({
      next: (response) => {
        this.user = response
      },
      error: (error) => console.log(error),
      complete: () => console.info('Traer al usuario exitoso')
    })
  }

  bringPendingSendFriendRequest(mail: string) {
    this.userService.getFriendRequestSent(mail).subscribe({
      next: (response) => {
        console.log(response)
        this.sentList = response
        this.sentList = this.sentList.slice(0, 1)
      },
      error: (error) => console.log(error),
      complete: () => console.info('Traer lista de solicitudes enviadas completado')
    })
  }

  bringFriendRequestReceived(mail: string) {
    this.userService.getFriendRequestRecieved(mail).subscribe({
      next: (response) => {
        this.receivedList = response
      },
      error: (error) => console.log(error),
      complete: () => console.info('Traer lista de solicitudes recibidas completado')
    })
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
