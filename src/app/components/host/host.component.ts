import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { UserService } from "src/app/services/user/user.service";
import { ProfileType } from "src/app/schemas/ProfileTypeJson";
import { RoomsService } from "src/app/services/rooms/rooms.service";
import { UserJson } from "src/app/schemas/UserJson";

import { HttpClient } from '@angular/common/http';
import { RoomJson } from "src/app/schemas/RoomJson";
import { forkJoin } from "rxjs";
import { __values } from "tslib";



@Component({
    selector: 'app-host',
    templateUrl: './host.component.html',
    styleUrls: ['./host.component.css', '../../../assets/style/main.css'],
    providers: [UserService, RoomsService]
})
export class HostComponent implements OnInit {
    profileGame!: UserJson;
    tokenExpiration!: string;
    profile!: ProfileType;
    user!: UserJson;
    server_name: string = '';
    rooms!: [string];
    roomsInfo: RoomJson[] = [];

    constructor(private userService: UserService, private roomService: RoomsService, private router: Router, private http: HttpClient) {
    }
    ngOnInit() {
        this.http.get('https://graph.microsoft.com/v1.0/me')
            .subscribe(profile => {
                this.profile = profile;
                if (this.profile && this.profile.mail) {
                    console.log(this.profile.mail)
                    this.bringUserInfo(this.profile.mail)
                    this.bringUserRooms(this.profile.mail)
                }
            });

    }

    createRoom(server_name: string) {
        this.roomService.createRoom(server_name).subscribe({
            next: (response) => {
                this.userService.addUserNewRoom(this.user.mail, response.toString()).subscribe({
                    next: (response) => console.log(response),
                    error: (error) => console.log(error),
                    complete: () => console.info('complete')
                })
                this.router.navigate(['/sala-espera'], { queryParams: { code: response.toString() } })
            },
            error: (error) => console.log(error),
            complete: () => console.info('complete')
        });
    }

    bringUserInfo(mail: string) {
        this.userService.getUser(mail).subscribe({
            next: (response) => {
                this.user = response
                console.log(this.user);
            },
            error: (error) => console.log(error),
            complete: () => console.info('complete')
        })
    }

    bringUserRooms(mail: string) {
        this.userService.getUserRooms(mail).subscribe({
            next: (response) => {
                this.rooms = response;
                console.log(this.rooms);
    
                // Inicializa el array roomsInfo para almacenar la información detallada de las habitaciones
                this.roomsInfo = [];
    
                // Por cada ID de habitación, obtener la información detallada
                this.rooms.forEach(roomId => {
                    this.roomService.getRoom(roomId).subscribe({
                        next: (room) => {
                            console.log(room);
                            this.roomsInfo.push(room); // Agrega la información de la habitación al array roomsInfo
                        },
                        error: (error) => console.error('Error al obtener la información de la habitación:', error),
                        complete: () => console.info('Obtención de información de la habitación completa')
                    });
                });
            },
            error: (error) => console.error('Error al obtener las habitaciones del usuario:', error),
            complete: () => console.info('Obtención de habitaciones del usuario completa')
        });
    }
    
    
    




}