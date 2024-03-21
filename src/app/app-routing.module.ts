import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { WaitRoomComponent } from './components/wait-room/wait-room.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { GameComponent } from './components/game/game.component';
import { BrowserUtils } from '@azure/msal-browser';

//colocar aqui las routas de navegación
const routes: Routes = [
  {path: "", component:HomeComponent, pathMatch: 'full' },
  {path: "buscar-sala", component:SearchComponent},
  {path: "sala-espera",component:WaitRoomComponent},
  {path: "lobby", component:GameComponent},
  {path: "**",component:PagenotfoundComponent}

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Don't perform initial navigation in iframes or popups
      initialNavigation:
        !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
          ? 'enabledNonBlocking'
          : 'disabled', // Set to enabledBlocking to use Angular Universal
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
