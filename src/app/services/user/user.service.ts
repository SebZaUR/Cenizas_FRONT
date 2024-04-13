import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mergeMap, Observable, switchMap } from 'rxjs';
import { UserJson } from 'src/app/schemas/UserJson';
import { enviroment } from 'src/enviroment/enviroment';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  public userUrlApi: string = enviroment.backLink + "/v1/users";
  

  constructor(private http: HttpClient) { }

  createUser(apodo: string, correo: string): Observable<any> {
    const params = new HttpParams().set('nickname',apodo).set('mail',correo)
    return this.http.post<any>(this.userUrlApi + "/create", null, {params:params});
  }
  
  getUser(correo:string):Observable<UserJson>{
    return  this.http.get<UserJson>(this.userUrlApi+"/"+correo);
  }

  getUserRooms(correo:string):Observable<[string]>{
    return this.http.get<[string]>(this.userUrlApi+"/"+correo+"/rooms")
  }

  addUserNewRoom(correo:string,code:string):Observable<any>{
    return this.getUserRooms(correo).pipe(
      mergeMap((rooms: string[]) => {
        rooms.push(code); // Agregar el nuevo código a la lista de salas
        return this.http.put<any>(`${this.userUrlApi}/${correo}/update-rooms`, rooms);
      })
    );
  }

  deleteUserRoom(correo: string, code: string): Observable<any> {
    return this.getUserRooms(correo).pipe(
      switchMap((rooms: string[]) => {
        const updatedRooms = rooms.filter(roomCode => roomCode !== code); // Filtrar el código a eliminar
        return this.http.put<any>(`${this.userUrlApi}/${correo}/update-rooms`, updatedRooms);
      })
    );
  }

  senFriendRequest(correoAmigo: string, correo:string): Observable<any> {
    const params = new HttpParams().set('friendMail',correo).set('user',correoAmigo)
    return this.http.post<any>(this.userUrlApi+"/sendFriendRequest",null, {params:params});
  }
}
