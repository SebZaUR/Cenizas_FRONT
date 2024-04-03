import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileType } from 'src/app/schemas/ProfileTypeJson';
import { UserJson } from 'src/app/schemas/UserJson';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-configure-room',
  templateUrl: './configure-room.component.html',
  styleUrls: ['./configure-room.component.css']
})
export class ConfigureRoomComponent implements OnInit {

  constructor(private roomService: RoomsService, private router: Router, private http: HttpClient, private userService: UserService) { }
  roomName: string = '';
  roomType: string = 'public';
  profile!: ProfileType;
  user: any;
  mail: any;

  ngOnInit(): void {
    this.http.get('https://graph.microsoft.com/v1.0/me')
      .subscribe(profile => {
        this.profile = profile;
        if (this.profile && this.profile.mail) {
          console.log(this.profile.mail)
          this.mail = this.profile.mail;
          this.userService.getUser(this.profile.mail).subscribe((room: UserJson) => { });;
        }
      });
  }

  createRoom() {
    const type =  this.roomType === "public" ? true : false;
    this.roomService.createRoom(this.roomName, type,this.mail).subscribe((response) => {
      const codigo = response[0]
      this.router.navigate(['/lobby'], { queryParams: { code: codigo } });
    },
      (error) => {
        alert("Ocurrio un error al intentar crear la sala");
      }
    );
  }

}
