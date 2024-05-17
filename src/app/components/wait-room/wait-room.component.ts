import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { RoomJson } from 'src/app/schemas/RoomJson';
import { RoomsService } from 'src/app/services/rooms/rooms.service';

@Component({
  selector: 'app-wait-room',
  templateUrl: './wait-room.component.html',
  styleUrls: [ '../../../assets/style/main.css'],
  providers: [RoomsService]
})
export class WaitRoomComponent implements OnInit {
  numberGamers: number = 0;
  code: string = '';
  room: RoomJson | null = null;
  users: string[] = [];

  constructor(private roomService: RoomsService, private route: ActivatedRoute, private router: Router,private appComponent: AppComponent) {
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
    });
    this.roomService.getRoom(this.code).subscribe((room: RoomJson) => {
      this.room = room;
    });
    this.roomService.getRoomUsers(this.code).subscribe((users: string[]) => {
      console.log(users);

    });
    this.numberGamers++;
    console.log(this.numberGamers);
  }

  startGame() {
    this.router.navigate(['/lobby'], { queryParams: { code: this.code } });
  }
}
