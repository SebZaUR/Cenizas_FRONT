import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { RoomsService } from 'src/app/services/rooms/rooms.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit{

   codigoSala : string ="";

  constructor(private roomService: RoomsService, private router :Router, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    // Not in Use
  }

  unirseSala(){
    console.log(this.codigoSala);
    this.roomService.getRoom(this.codigoSala).subscribe((response) => {
      const codigo = response[0].code;
      console.log("Codigo de la sala:" +codigo);
      this.router.navigate(['/sala-espera'], {queryParams:{code: codigo}});
    },
    (error) =>{
      this.router.navigate(['/sala-no-existe']);
      }
    );
  }
}
