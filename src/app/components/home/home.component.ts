import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { RoomsService } from '../../services/rooms/rooms.service';
import { PopupService } from 'src/app/services/popup/popup.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../../assets/style/main.css']
})
export class HomeComponent implements OnInit{

  constructor(private router: Router, private roomService:RoomsService,private popup: PopupService, private http: HttpClient){}


  ngOnInit(): void {
  }

  crearSala(){
    this.router.navigate(["/configure"]);
   }
}
