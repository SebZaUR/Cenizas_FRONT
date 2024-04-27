import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { DesertScene } from './scenes/DesertScene';
import { io } from 'socket.io-client';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { ActivatedRoute } from '@angular/router';
import { RoomJson } from 'src/app/schemas/RoomJson';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user/user.service';
import { ProfileType } from 'src/app/schemas/ProfileTypeJson';
import { UserJson } from 'src/app/schemas/UserJson';
import { enviroment } from 'src/enviroment/enviroment';
import { CavernaScene } from './scenes/CavernaScene';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css', '../../../assets/style/main.css']
})

export class GameComponent implements OnInit {
  socket = io(enviroment.socketLink);
  phaserGame!: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  code: string = '';
  users: string[] = [];
  room!: RoomJson;
  profile!: ProfileType;
  user: any;
  mail: any;

  constructor(private roomService: RoomsService, private route: ActivatedRoute, private http: HttpClient, private userService: UserService) {
    this.config = {
      type: Phaser.AUTO,
      scene: [new MainScene('MainScene', this.socket, this.code), 
              new DesertScene('DesertScene', this.socket, this.code),
              new CavernaScene('CavernaScene', this.socket, this.code)],
      width: 900,
      height: 630,
      parent: 'gameContainer',
      title: "Cenizas RPG",
      physics: {
        default: 'matter',
        matter: {
          debug: false,
          gravity: { x: 0, y: 0 }
        }
      },
    };
  }
  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
    this.http.get('https://graph.microsoft.com/v1.0/me')
            .subscribe(profile => {
                this.profile = profile;
                if (this.profile && this.profile.mail) {
                    this.mail =  this.profile.mail;
                    this.userService.getUser(this.profile.mail).subscribe((room: UserJson) => {
                        this.user = room;
                      });;
                }
            });
    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
      this.socket.emit('joinRoom', this.code)
    });
    this.roomService.getRoom(this.code).subscribe({
      next: (response) => {
        this.room = response
        this.switchRoom(true)
      },
      error: (error) => console.log(error),
      complete: () => console.info('Traer room completo')
    });

    this.socket.on('turnOffRoom', (data) => {
      console.log(`Apagame esta monda Room : ${data}`);
      this.switchRoom(false)
    })
  }

  switchRoom(state: boolean) {
    if (state) {
      this.roomService.updateRoomOn(this.room.code).subscribe({
        next: () => console.info('online'),
        error: (error) => console.log(error),
        complete: () => console.info('Room on completo')
      })
    } else {
      this.roomService.updateRoomOff(this.room.code).subscribe({
        next: () => console.info('offline'),
        error: (error) => console.log(error),
        complete: () => console.info('Room off completo')
      })
    }
  }
}