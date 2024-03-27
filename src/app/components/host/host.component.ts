import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { UserService } from "src/app/services/user/user.service";
// Required for the HTTP GET request to Graph
import { HttpClient } from '@angular/common/http';
import { user } from "src/app/JsonType/user";

type ProfileType = {
    businessPhones?: string,
    displayName?: string,
    givenName?: string,
    jobTitle?: string,
    mail?: string,
    mobilePhone?: string,
    officeLocation?: string,
    preferredLanguage?: string,
    surname?: string,
    userPrincipalName?: string,
    id?: string
}

@Component({
    selector:'app-host',
    templateUrl:'./host.component.html',
    styleUrls:['./host.component.css','../../../assets/style/main.css'],
    providers: [UserService]
})
export class HostComponent implements OnInit{
    profile!: ProfileType;
    profileGame!: user;
    tokenExpiration!: string;
    constructor(private userService:UserService, private route: ActivatedRoute,private http: HttpClient){
    }
    ngOnInit() {
        this.http.get('https://graph.microsoft.com/v1.0/me')
          .subscribe(profile => {
            this.profile = profile;
        });
        this.tokenExpiration = localStorage.getItem('tokenExpiration')!;
    }
}