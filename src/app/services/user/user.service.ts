import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { user } from 'src/app/JsonType/user';
import { sesion } from 'src/app/JsonType/sesion';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  public userUrlApi: string ="http://localhost:8080/v1/users";
  crearUsuario : sesion |  undefined;

  constructor(private http: HttpClient) { }

  createUser(apodo: string, correo: string): Observable<any> {
    this.crearUsuario = {mail:correo, nickname: apodo}
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.userUrlApi + "/create", this.crearUsuario);
  }
  

  startSession(correo:string):Observable<user>{
    return  this.http.get<user>(this.userUrlApi+"/"+correo);
  }
}
