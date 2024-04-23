import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { UserService } from "src/app/services/user/user.service";
import { HttpClient } from '@angular/common/http';
import { ProfileType } from "src/app/schemas/ProfileTypeJson";
import { UserJson } from "src/app/schemas/UserJson";
import { io } from 'socket.io-client';
import { enviroment } from 'src/enviroment/enviroment';
import { FriendRequest } from "src/app/schemas/FriendRequest";

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['../../../assets/style/main.css']
})
export class FriendsComponent implements OnInit {
    socket = io(enviroment.socketLink);
    profile!: ProfileType;
    user!: UserJson;
    nickname!: string;
    friendMail: string = "";
    sentList: FriendRequest[] = [];
    receivedList: FriendRequest[] = [];
    showError: boolean = false;
    friends: string[] = [];

    constructor(private userService: UserService, private router: Router, private http: HttpClient) { }

    ngOnInit(): void {
        this.http.get('https://graph.microsoft.com/v1.0/me')
            .subscribe(profile => {
                this.profile = profile;
                if (this.profile && this.profile.mail && this.profile.displayName) {
                    this.nickname = this.profile.displayName;
                    this.bringUserInfo(this.profile.mail)
                    this.socket.connect()
                    this.socket.emit('registPlayer', ({ user: this.profile.mail, id: this.socket.id }))
                    this.bringPendingSendFriendRequest(this.profile.mail)
                    this.bringFriendRequestReceived(this.profile.mail)
                    this.bringUserFriends(this.profile.mail)
                }
            });
        this.socket.on('friendRequestReceived', (data) => {
            // Lógica para manejar la solicitud de amistad recibida
            console.log(`El usuario con correo electrónico ${data} te envio una solicitud.`);
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
                complete: () => console.info('complete')
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
            complete: () => console.info('Respuesta complete')
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
}