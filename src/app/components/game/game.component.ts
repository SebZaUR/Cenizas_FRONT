import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser'; //import Phaser
import { MainScene } from './scenes/MainScene';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit {
  phaserGame!: Phaser.Game; 
  config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      scene: [ MainScene ],
      width: 900,
      height: 630,
      parent: 'gameContainer',
      title: "Cenizas RPG",
      physics: {
        default: 'matter',
        matter: {
           debug:true,
           gravity: { x: 0, y: 0 }
          }
      },
    };
  }
  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }
}