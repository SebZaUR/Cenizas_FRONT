import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomsService } from 'src/app/services/rooms/rooms.service';

@Component({
  selector: 'app-wait-room',
  templateUrl: './wait-room.component.html',
  styleUrls: ['./wait-room.component.css'],
  providers: [RoomsService],
  template: `
  <div>
      <p>Cantidad de personas en la página: {{ numberGamers }}</p>
      <!-- Aquí iría el contenido de tu componente -->
    </div>
  `
})
export class WaitRoomComponent implements OnInit {
  numberGamers : number = 0;

  constructor(private roomService: RoomsService, private route: ActivatedRoute){
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const codigo = params['code'];
    });
    this.numberGamers++;
    console.log(this.numberGamers);
  }
}
