import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
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
  async getRoomAsync(codigo: string): Promise<RoomJson> {
    try {
      const room = await firstValueFrom(this.http.get<RoomJson>(`${this.roomApiUrl}/${codigo}`));
      return room;
    } catch (error) {
      // Manejo de errores
      console.error('Error al obtener la sala:', error);
      throw error;
    }
  }

  getRooms(): Observable<RoomJson[]> { 
    return this.http.get<RoomJson[]>(this.roomApiUrl); 
  }

  getRoomUsers(codigo:string): Observable<string[]> { 
    return this.http.get<string[]>(this.roomApiUrl+"/"+codigo+"/users-in-room"); 
  }

  createRoom(serverName:string, isPublic:boolean,user:string): Observable<any>{
    const params = new HttpParams().set('server_name', serverName).set("isPublic" ,isPublic).set( 'user_creator', user );
    return this.http.post<any>(this.roomApiUrl+"/create",null, { params: params });
  }

  addUserToRoom(user:string,code:string):Observable<any>{
    const params = new HttpParams().set('code',code).set('user',user);
    return this.http.put<any>(this.roomApiUrl+"/"+code+"/update-users",null, { params: params });
  }

  deleteRoom(code:string):Observable<any>{
    return this.http.delete<any>(this.roomApiUrl+"/"+code+"/delete");
  }
}
