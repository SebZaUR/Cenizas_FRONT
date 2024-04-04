import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mergeMap, Observable } from 'rxjs';
import { UserJson } from 'src/app/schemas/UserJson';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  public userUrlApi: string ="http://localhost:8080/v1/users";
  

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
}
