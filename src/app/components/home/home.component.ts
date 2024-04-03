import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { RoomsService } from '../../services/rooms/rooms.service';
import { PopupService } from 'src/app/services/popup/popup.service';
import { HttpClient } from '@angular/common/http';
import { ProfileType } from 'src/app/schemas/ProfileTypeJson';
import { UserService } from 'src/app/services/user/user.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../../assets/style/main.css']
})
export class HomeComponent implements OnInit{

  constructor(private router: Router, private roomService:RoomsService,private popup: PopupService, private http: HttpClient,private userService: UserService){}

  profile!: ProfileType;
  user: any;

  ngOnInit(): void {
    this.popup.openPopUp();
    this.http.get('https://graph.microsoft.com/v1.0/me')
            .subscribe(profile => {
                this.profile = profile;
                if (this.profile && this.profile.mail) {
                    this.user = this.profile.mail;
                }
            });
  }

  crearSala(user: string){
    let roomName = prompt("Por favor, ingrese el nombre del nuevo plano:");
    while(roomName == null){
      alert('El campo no puede estar vacío');
      roomName = prompt("Por favor, ingrese el nombre del nuevo plano:");
    }
    this.roomService.createRoom(roomName).subscribe((response) => {
      const codigo=response[0]
      this.router.navigate(['/lobby'], {queryParams:{code: codigo}});
     },
     (error) =>{
       alert("Ocurrio un error al intentar crear la sala");
       }
     );
   }

  escribirCodigo(){
    this.router.navigate(['/buscar-sala']);
  }

  

}
