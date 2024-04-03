import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { RoomJson } from 'src/app/schemas/RoomJson';
import { HttpClient } from '@angular/common/http';
import { ProfileType } from 'src/app/schemas/ProfileTypeJson';
import { UserJson } from 'src/app/schemas/UserJson';
import { UserService } from 'src/app/services/user/user.service';

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
    this.listRooms(); 
  }

  joinRoom(codigoSala: string) {
    this.http.get('https://graph.microsoft.com/v1.0/me')
    .subscribe(profile => {
        this.profile = profile;
        if (this.profile && this.profile.mail) {
            this.userService.getUser(this.profile.mail).subscribe((room: UserJson) => {});;
        }
    });
    this.roomService.getRoom(this.codigoSala).subscribe((room: RoomJson) => {
      this.room = room;
      this.mail =this.profile?.mail 
      this.roomService.addUserToRoom(this.mail,this.codigoSala).subscribe(()=>{});
    },(error) => {
        alert(error.message);
      }
    );
  }

  listRooms() {
    this.roomService.getRooms().subscribe(
      (response) => {
        console.log(response);
        this.rooms = response; // Almacenar las habitaciones en la variable de componente
      },
      (error) => {
        console.log(error);
      }
    );
  }

  createRoom(server_name:string){
    this.roomService.createRoom(server_name).subscribe(
      (response) => {
        console.log(response);
        response.toString()
        this.router.navigate(['/sala-espera'],{ queryParams: { code: response.toString() } });
      },
      (error) => {
        console.log(error);
        // Aquí puedes manejar el error, como mostrar un mensaje al usuario
      }
    );
  }
}

