import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser'; 
import { MainScene } from './scenes/MainScene';
import { DesertScene } from './scenes/DesertScene';
import { io } from 'socket.io-client';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css','../../../assets/style/main.css']
})

export class GameComponent implements OnInit {
  socket = io('http://localhost:2525/');
  phaserGame!: Phaser.Game; 
  config: Phaser.Types.Core.GameConfig;
  
  constructor() {
    this.config = {
      type: Phaser.AUTO,
      scene: [ new MainScene('MainScene', this.socket), new DesertScene('DesertScene', this.socket) ],
      width: 900,
      height: 630,
      parent: 'gameContainer',
      title: "Cenizas RPG",
      physics: {
        default: 'matter',
        matter: {
           debug:false,
           gravity: { x: 0, y: 0 }
          }
      },
    };
  }
  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }
}