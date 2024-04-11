import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { RoomJson } from 'src/app/schemas/RoomJson';
import { HttpClient } from '@angular/common/http';
import { ProfileType } from 'src/app/schemas/ProfileTypeJson';
import { UserJson } from 'src/app/schemas/UserJson';
import { UserService } from 'src/app/services/user/user.service';
import { NgxInfiniteScrollService } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css','../../../assets/style/main.css'] 
})
export class SearchComponent {
  codigoSala: string = '';
  server_name: string = '';
  rooms: RoomJson[] = [];
  room: RoomJson | null = null;
  profile!: ProfileType;
  user: any;
  mail: any;

  constructor(private roomService: RoomsService, private router: Router, private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.http.get('https://graph.microsoft.com/v1.0/me')
    .subscribe(profile => {
        this.profile = profile;
        this.mail = this.profile.mail;
        if (this.profile && this.profile.mail) {
            this.userService.getUser(this.profile.mail).subscribe((room: UserJson) => {});;
        }
    });
  }

  joinRoom(codigoSala: string) {
    this.roomService.getRoom(codigoSala).subscribe((room: RoomJson) => {
      this.room = room;
      this.mail =this.profile?.mail 
      this.roomService.addUserToRoom(this.mail,codigoSala).subscribe(()=>{});
      this.router.navigate(['/lobby'],{queryParams : {code : codigoSala}})
    }
    );
  }

  listRooms() {
    this.rooms.splice(0, this.rooms.length);
    this.roomService.getRooms().subscribe(
      (response) => {
        for(let i =0; response.length;i++){
          if(response[i].public){
            this.rooms.push(response[i]);
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadFriendRoom(){

  }
}

