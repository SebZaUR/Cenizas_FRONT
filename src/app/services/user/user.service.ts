import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { user } from 'src/app/JsonType/user';
import { sesion } from 'src/app/JsonType/sesion';


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
  

  startSession(correo:string):Observable<user>{
    return  this.http.get<user>(this.userUrlApi+"/"+correo);
  }
}
