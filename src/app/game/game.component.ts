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
      width: 600,
      height: 600,
      parent: 'gameContainer',
      title: "Cenizas RPG",
      backgroundColor: "#18216D",
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