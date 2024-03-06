import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser'; //import Phaser

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

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }
  private player!: Phaser.Physics.Matter.Sprite;

  keys!:any;

  private isKnockedDown: boolean = false; //is our player knocked down?
  private isAttacking: boolean = false; //is our player attacking?
  private lastDirection: string = "down";//what was the last direction our player was facing?
  private playerVelocity = new Phaser.Math.Vector2(); //track player velocity in a 2d vector

  preload() {
    this.load.spritesheet("player", "assets/characters/player.png",{
        frameWidth:48,
        frameHeight:48
      })
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    this.matter.world.setBounds(-20, -20, width + 40, height + 20);
    this.player = this.matter.add.sprite(300, 300, 'player');
    this.player.setSize(2, 2);
    this.player.setScale(2, 2);
    this.player.setFixedRotation();

    if (this.input && this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys({ 
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'right': Phaser.Input.Keyboard.KeyCodes.D,
        'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
        's1': Phaser.Input.Keyboard.KeyCodes.ONE
      });
    } else {
      console.error("No se pudo inicializar 'keys': input.keyboard es nulo.");
    }


    this.anims.create({
      key: 'attack_down',
      frames: this.anims.generateFrameNumbers('player', { start: 36, end: 39 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'attack_right',
      frames: this.anims.generateFrameNumbers('player', { start: 42, end: 45 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'attack_left',
      frames: this.anims.generateFrameNumbers('player', { start: 42, end: 45 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'attack_up',
      frames: this.anims.generateFrameNumbers('player', { start: 48, end: 51 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'move_x',
      frames: this.anims.generateFrameNumbers('player', { start: 24, end: 29 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', { start: 30, end: 35 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'stand_down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'stand_up',
      frames: this.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'stand_left',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'stand_right',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'dead',
      frames: this.anims.generateFrameNumbers('player', { start: 54, end: 56 }),
      frameRate: 4,
      repeat: 0,
    });
    this.anims.create({
      key: 'laying',
      frames: this.anims.generateFrameNumbers('player', { start: 56, end: 56 }),
      frameRate: 10,
      repeat: 10,
    });

  }
  
    override update(){
      //================================  
      //  first priority, set default: 
      //================================  
      //if No input set to standing still
     if(this.keys.up.isUp && this.keys.down.isUp && this.keys.left.isUp && this.keys.right.isUp && this.keys.space.isUp && !this.isKnockedDown){
          this.player.anims.play('stand_'+this.lastDirection, true);
      }
    //================================  
    //  Next set important variables 
    //================================  
    //set attacking flag if currently attacking
    this.isAttacking = this.keys.space.isDown; 
    //set isKnockedDown to false if we are no longer in the knocked down animation 
    if (this.player && this.player.anims && this.player.anims.currentAnim) {
      if (this.player.anims.currentAnim.key == 'stand_' + this.lastDirection) {
        // Hacer algo si la animación actual es 'stand_' + this.lastDirection
      }
    } else {
      console.error("No se pudo acceder a 'anims' o 'currentAnim' de this.player: alguna de estas propiedades es null.");
    }

        //================================  
    //  Game Logic 
    //================================  
    //we can't do anything if we are currently knocked down/incapacitated
    if(!this.isKnockedDown){
      //set the isKnockedDown flag if conditions are met and run the appropriate animation
      if (this.keys.s1.isDown) {
        this.player.setVelocity(0, this.playerVelocity.y);
        this.isKnockedDown=true;
        this.player.anims.play('dead');
        this.player.anims.stopAfterRepeat(0);
        this.player.anims.chain('laying');
        //this.player.anims.chain('stand_'+this.lastDirection);
        return; //skip the rest of the update 
      }

      if (this.isAttacking) {
        this.playerVelocity.x=0;
        this.playerVelocity.y=0;
        this.player.anims.play('attack_'+this.lastDirection, true);
      }

      if (this.isAttacking) {
        this.playerVelocity.x=0;
        this.playerVelocity.y=0;
        this.player.anims.play('attack_'+this.lastDirection, true);
      }else{ //not attacking, check movement
        if (this.keys.up.isDown) {  // Move up
          this.playerVelocity.y=-1;
          if(this.playerVelocity.x == 0){
            this.player.anims.play('up', true);
          }
          this.lastDirection="up";
        } else if (this.keys.down.isDown) {   // Move down
          this.playerVelocity.y=1;
          if(this.playerVelocity.x == 0){
            this.player.anims.play('down', true);
          }
          this.lastDirection="down";
        } else {
          // Stop vertical movement
          this.playerVelocity.y=0;
        }

        if (this.keys.left.isDown) { // Move left
          this.player.setFlipX(true);
          this.playerVelocity.x=-1;
          this.player.anims.play('move_x', true); //only do the x animation if we arent moving diag
          this.lastDirection="left";
        } else if (this.keys.right.isDown) {  // Move right
          this.playerVelocity.x=1;
          this.player.anims.play('move_x', true);
          this.player.setFlipX(false);
          this.lastDirection="right";
        } else {
          // Stop horizontal movement
          this.playerVelocity.x=0;
        }
      
      }
      this.playerVelocity.normalize();
      this.playerVelocity.scale(1.2);
      this.player.setVelocity(this.playerVelocity.x, this.playerVelocity.y);
  } 
}
}