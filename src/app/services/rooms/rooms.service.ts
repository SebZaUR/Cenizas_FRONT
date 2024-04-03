import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RoomJson } from 'src/app/schemas/RoomJson';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  private roomApiUrl = "http://localhost:8080/v1/rooms";

  constructor(private http: HttpClient) { }

  getRoom(codigo:string):Observable<RoomJson> {
    return this.http.get<RoomJson>(this.roomApiUrl+"/"+codigo);
  }

  getRooms(): Observable<RoomJson[]> { 
    return this.http.get<RoomJson[]>(this.roomApiUrl); 
  }

  getRoomUsers(codigo:string): Observable<string[]> { 
    return this.http.get<string[]>(this.roomApiUrl+"/"+codigo+"/users-in-room"); 
  }

  createRoom(serverName:string): Observable<any>{
    const params = new HttpParams().set('server_name', serverName);
    return this.http.post<any>(this.roomApiUrl+"/create",null, { params: params });
  }

  addUserToRoom(user:string,code:string):Observable<any>{
    const params = new HttpParams().set('code',code).set('user',user);
    const codigo  = code

    console.log(typeof codigo);
    alert(this.roomApiUrl+"/"+code+"/update-users")
    return this.http.put<any>(this.roomApiUrl+"/"+code+"/update-users",null, { params: params });
  }
}
