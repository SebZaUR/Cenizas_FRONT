import { right } from '@popperjs/core';

import { ObjectCoollectible } from '../objects/objectCoollectible';
import { Text } from '@angular/compiler';
import { ScoreBoard } from '../objects/scoreBoard';
import { MainScene } from './MainScene';

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

export class DesertScene extends MainScene {
    protected override startx!: number;
    protected override starty: number = 270;
    protected hitTimer!: Phaser.Time.TimerEvent;
    protected heartsGroup!: Phaser.GameObjects.Group;
    protected cantidadVida: number = 100;
    protected golpePorCorazon: number = 20;
    protected isHit: boolean = false;
    protected itemsType:  string[]= ["Llave","Herramienta","Metal"];
    protected items: ObjectCoollectible[] = [];
    protected posicionesItems: { x: number, y: number }[] = [];
    protected posicionesInicialesEsqueletos: { x: number, y: number }[] = [];
    protected skeletonsGroup: Phaser.Physics.Matter.Sprite[] = [];
    protected skeletonDirections: { skeleton: Phaser.Physics.Matter.Sprite, direction: Direction }[] = [];
    protected skeletosnLife: number[] = []; 
    protected skeletonsHitted: boolean[] = []; 
    protected skeletonHitted: boolean =false;
    protected skeletonSpeed = 0.7; 
    protected cantidadVidaEnemigo: number = 100;
    protected golpePorespada: number = 30;
    protected  count: number[] = [];
    protected gameOverScreen!: HTMLElement;
    protected scoreText!: any; 
    itemsTypeCollected: any;
    constructor(key: string, socket: any, code: string) {
        super(key, socket, code);
    }

    override init(data: any) {
        this.socket.connect();
        this.code = data.code;
        this.socket.emit('joinRoom', this.code);
        this.socket.off('initialCoordinates');
        this.socket.off('firstPlayer');
        this.socket.off('playerNumber');
        this.socket.off('goToDesert');
        this.socket.id = data.socketId;
        this.myNumber = data.myNumber;
        this.scoreText = new ScoreBoard(this);
        
        this.socket.on('connect', () => {
            if (this.socket.id) {
                this.playerId = this.socket.id;
                this.getTurn(this.myNumber); 
            } 
        });

        this.socket.on('playerDisconnected', (playerId: string) => {
            const disconnectedPlayerSprite = this.otherSprites[playerId];
            if (disconnectedPlayerSprite) {
                disconnectedPlayerSprite.destroy(); 
                delete this.otherSprites[playerId]; 
            }
        });

        this.socket.on('goToCave', (data) => {
            data.socketId = this.socket.id;
            data.myNumber = this.myNumber;
            data.code = this.code;
            this.sound.stopAll();
            this.tweens.add({
                targets: this.cameras.main,
                alpha: 0,
                duration: 2000,
                onComplete: () => {
                    this.scene.start('CavernaScene',  data);
                    this.socket.disconnect();
                    this.scene.stop('DesertScene');
                }
            });
        });
    }

    override preload() {
        super.preload();
        this.load.tilemapTiledJSON('first', 'assets/backgrounds/desert.json');
        this.load.image('desert', 'assets/backgrounds/desert.png');
        this.load.audio('desertMusic', 'assets/music/desertMusic.ogg');
        this.load.spritesheet("Skeleton", "assets/characters/Skeleton.png", {
            frameWidth: 64,
            frameHeight: 64
        });
        //this.itemsTypeCollected["Llave"] = 0;
        //this.itemsTypeCollected["Herramienta"] = 0;
        //this.itemsTypeCollected["Metal"] = 0;
    }

    override create() {
        var desert;
        const music = this.sound.add('desertMusic', { loop: true });
        const { width, height } = this.sys.game.canvas;
        music.play();
        super.create_mapa(width, height + 380, 'first', 'desert', 'desert', ['suelo','objetos','solidos'],desert);
        
        this.socket.emit('valueCordinates', {
            validCoordinates: super.validCoordinates()
        });

        this.socket.on('valueCordinates', (data) => {
            this.posicionesInicialesEsqueletos = data.posicionesInicialesEsqueletos;
            this.posicionesItems = data.posicionesItems;
            this.createSkeletons();
            this.createItems();
        });
        
        super.create_player(width, height + 380, this.startx, this.starty, 'player');
        this.createLifeBar();
        this.createGameOver();
        this.create_remote_players();
        this.create_animationSkeleton();
        this.scoreText = new ScoreBoard(this);
        this.cameras.main.setAlpha(0);

        this.matter.world.on('collisionstart', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
        
                this.skeletonsGroup.forEach((skeleton) => {
                    if ((bodyA === skeleton.body || bodyB === skeleton.body) && this.myNumber == 1) {
                        this.changeSkeletonDirection(skeleton);
                    } else{
                        this.socket.on('directionsEnemys', (data) => {
                            this.skeletonDirections[data.index].direction = data.direction;
                        });
                    }
                });
                this.items.forEach((item) =>{
                    if ((bodyA === item.body && bodyB === this.player.body) || (bodyA === this.player.body && bodyB === item.body)){
                        this.collectItem(item);
                    }else if(bodyA === this.player.body && bodyB === item.body){
                        this.collectItem(item);
                    } 
                });
            });
        });

        this.tweens.add({
            targets: this.cameras.main,
            alpha: 1,
            duration: 2000,
            onComplete: () => {}
        });
    }

    protected changeSkeletonDirection(skeleton: Phaser.Physics.Matter.Sprite) {
        const index = this.skeletonDirections.findIndex(item => item.skeleton === skeleton);
        if (index !== -1) {
            const randomDirection = Phaser.Math.Between(0, 3);
    
            switch(randomDirection) {
                case 0:
                    this.skeletonDirections[index].direction = Direction.UP;
                    break;
                case 1:
                    this.skeletonDirections[index].direction = Direction.DOWN;
                    break;
                case 2:
                    this.skeletonDirections[index].direction = Direction.LEFT;
                    break;
                case 3:
                    this.skeletonDirections[index].direction = Direction.RIGHT;
                    break;
                default:
                    break;
            }

            this.socket.emit('directionsEnemys', {
                code: this.code,
                index: index,
                direction: this.skeletonDirections[index].direction
            });   
        }
    }

    protected create_skeleton ( position_x: number, position_y: number, spray: string) {
        const skeleton = this.matter.add.sprite(position_x, position_y, spray);
        skeleton.setDisplaySize(90, 90);
        skeleton.setRectangle(15, 25);
        skeleton.setOrigin(0.50, 0.55);
        skeleton.setFixedRotation();
        skeleton.anims.play('caminar');
        this.skeletosnLife.push(this.cantidadVidaEnemigo); 
        this.skeletonsHitted.push(this.skeletonHitted); 
        return skeleton;
    }

    protected createSkeletons() {
        const numSkeletons = 6; 
        for (let i = 0; i < numSkeletons; i++) {
            const posX = this.posicionesInicialesEsqueletos[i].x;
            const posY = this.posicionesInicialesEsqueletos[i].y;            
            const skeleton = this.create_skeleton(posX, posY, 'Skeleton');
            this.skeletonsGroup.push(skeleton);
            this.count.push(0);
        }
        this.skeletonsGroup.forEach(skeleton => {
            const direction =  Direction.LEFT ;
            this.skeletonDirections.push({ skeleton, direction });
        });
    }

    
    protected createLifeBar() {
        this.heartsGroup = this.add.group();
        for (let i = 0; i < 5; i++) {
            const heart = this.add.image(300 + i * 20, 210, 'corazon').setScrollFactor(0);
            this.heartsGroup.add(heart);
        }
    }

    protected create_animationSkeleton() {
        this.anims.create({
            key: 'caminar',
            frames: this.anims.generateFrameNumbers('Skeleton', { start: 26, end: 37}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'reposo',
            frames: this.anims.generateFrameNumbers('Skeleton', { start: 39, end:41 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'morido',
            frames: this.anims.generateFrameNumbers('Skeleton', { start: 14, end:25 }),
            frameRate: 5,
            repeat: 0
        });
        this.anims.create({
            key: 'apuyalado',
            frames: this.anims.generateFrameNumbers('Skeleton', { start: 4, end:10 }),
            frameRate: 5,
            repeat: -1
        });

    }

    protected override async create_remote_players() {
        this.socket.emit('updatePlayers', {
            posx: this.player.x, 
            posy: this.player.y, 
            velocityx: this.playerVelocity.x, 
            velocityy: this.playerVelocity.y, 
            animation: this.player.anims.currentAnim,
            key: this.player.anims.currentAnim?.key,
            code: this.code
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        super.create_remote_players();
    }

    override update() {
        const startButton = document.getElementById('startButton');
        if (startButton && startButton.parentNode) {
            startButton.parentNode.removeChild(startButton);
        }
        super.update();

        this.socket.on('updateSkeleton', (skeletonData) => {
            this.updateSkeleton(skeletonData);
        });

        this.socket.on('deadSkeleton', (data) => {
            this.matarEsqueleto(data.index);
        });

        this.socket.on('imHitted', (playerId: string) => {
            const existingSprite = this.otherSprites[playerId];
            this.tweenTint(existingSprite, 0xff0000, 500, () => {
            });
        });
    
        this.skeletonsGroup.forEach((skeleton: Phaser.Physics.Matter.Sprite, index: number) => {
            const life = this.skeletosnLife[index];
            const hit = this.skeletonsHitted[index];
            
            if (this.isAttacking && this.checkDistance(this.player, skeleton) && !hit && life > 0) {
                skeleton.setTint(0xff0000);
                this.skeletonsHitted[index] = true;
                this.hitTimer = this.time.delayedCall(350, () => {
                    this.skeletonsHitted[index] = false;
                });
                this.skeletosnLife[index] -= this.golpePorespada;
            }

    
            if (this.isAttacking === false && this.checkDistance(this.player, skeleton)) {
                skeleton.clearTint();
            }
            if (this.skeletosnLife[index]< 0 && this.count[index]==0){
                this.matarEsqueleto(index);
                this.scoreText.incrementScore(10);
                this.socket.emit('deadSkeleton', {
                    code: this.code,
                    index: index,
                });
            }

            let velocityX = 0;
            let velocityY = 0;

            switch (this.skeletonDirections[index].direction) {
                case Direction.UP:
                    velocityY = this.skeletonSpeed;
                    velocityX = 0;
                    break;
                case Direction.DOWN:
                    velocityY = -this.skeletonSpeed;
                    velocityX = 0;
                    break;
                case Direction.LEFT:
                    velocityX = -this.skeletonSpeed;
                    velocityY = 0
                    break;
                case Direction.RIGHT:
                    velocityX = this.skeletonSpeed;
                    velocityY = 0;
                    break;
            }

            this.socket.emit('updateSkeleton', {
                index: this.skeletonsGroup.indexOf(skeleton),
                velocityX: velocityX,
                velocityY: velocityY,
                key: skeleton.anims.currentAnim?.key,
                color: skeleton.tint,
                code: this.code
            });
        });
    
        this.matter.world.on('collisionstart', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
    
                this.skeletonsGroup.forEach((skeleton,index) => {
                    if (this.skeletosnLife[index] > 0  ) {
                        if(bodyA === this.player.body && bodyB === skeleton.body){
                            this.reduceLife();
                            skeleton.anims.play('apuyalado');
                        } else if(this.chequearColisionRemota(skeleton, bodyA, bodyB)){
                            // Le estan cascando a mi pana <---- 
                            skeleton.anims.play('apuyalado');

                        } else{
                            skeleton.anims.play('caminar');
                        }
                    }
                });
            });
        });

        if (this.player.x >814  && this.player.x < 819 
            && this.player. y > 575  && this.player.y < 585 ){
                this.socket.emit('goToCave', {
                    mapaActual: 'DesertScene',
                    idOwner:this.socket.id,
                });
            } 
    }
    
    protected checkDistance(bodyA: Phaser.Physics.Matter.Sprite, bodyB: Phaser.Physics.Matter.Sprite) {
        const distance = Phaser.Math.Distance.Between(bodyA.x, bodyA.y, bodyB.x, bodyB.y);
        return distance < 50 ;
    }

    protected chequearColisionRemota(skeleton: Phaser.Physics.Matter.Sprite, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): boolean {
        const skeletonBody = skeleton.body as MatterJS.BodyType;
    
        for (const spriteId in this.otherSprites) {
            if (Object.prototype.hasOwnProperty.call(this.otherSprites, spriteId)) {
                const sprite = this.otherSprites[spriteId] as Phaser.Physics.Matter.Sprite;
                if ((sprite.body === bodyA && bodyB === skeletonBody) ||
                    (sprite.body === bodyB && bodyA === skeletonBody)) {
                    return true;
                }
            }
        }
    
        return false;
    }
    
    protected matarEsqueleto( index: number) {
        const skeletonToUpdate = this.skeletonsGroup[index];
        this.count[index]+=1;      
        skeletonToUpdate.setVelocity(0, 0);
        skeletonToUpdate.anims.stop();
        skeletonToUpdate.anims.play('morido');
        skeletonToUpdate.anims.stopAfterRepeat(0);
        skeletonToUpdate.setStatic(true);
        this.time.delayedCall(1400, () => {
            skeletonToUpdate.setVisible(false);
            skeletonToUpdate.setSensor(true);
            skeletonToUpdate.setCollisionCategory(0);
        }, [], this);
    }

    protected getTurn(myNumber: number) {
        switch (myNumber) {
            case 1:
                this.startx = 170;
                break;
            case 2:
                this.startx = 200;
                break;
            case 3:
                this.startx = 230;
                break;
            case 4:
                this.startx = 260;
                break;
            default:
                this.startx = 170; 
                break;
        }
    } 
    
    protected updateSkeleton(data: any) {
        const skeletonToUpdate = this.skeletonsGroup[data.index];
        if (skeletonToUpdate) {
            skeletonToUpdate.setVelocityX(data.velocityX)
            skeletonToUpdate.setVelocityY(data.velocityY)
            skeletonToUpdate.setTint(data.color);
        }
    }

    protected reduceLife() {
        if (this.cantidadVida > 0 && this.isHit == false) {
            this.cantidadVida -= this.golpePorCorazon;
            this.tweenTint(this.player, 0xff0000, 500, () => {

            });
            this.socket.emit('imHitted');
            this.updateLifeBar()
        }

        if (this.cantidadVida == 0) {
            this.player.setVelocity(0, 0);
            this.isKnockedDown = true;
            this.player.anims.play('dead');
            this.player.anims.stopAfterRepeat(0);
            this.player.setStatic(true); 
            this.gameOver();
            this.socket.emit('updatePlayers', {
                posx: this.player.x, 
                posy: this.player.y, 
                velocityx: 0, 
                velocityy: 0,
                animation: this.player.anims.currentAnim, 
                key: undefined,
                code: this.code,
            });
            return;
        }
    }

    protected updateLifeBar() {
        const heartsToShow = Math.ceil(this.cantidadVida / this.golpePorCorazon);
        this.isHit = true;
        this.hitTimer = this.time.delayedCall(1000, () => {
            this.isHit = false;
        });
        this.heartsGroup.children.each((heart: Phaser.GameObjects.GameObject, index: number) => {
            if (heart instanceof Phaser.GameObjects.Image) {
                if (index >= heartsToShow) {
                    heart.visible = false;
                } else {
                    heart.visible = true;
                }
                return true;
            }
            return null;
        });
        
    }
    protected tweenTint(sprite: Phaser.GameObjects.Sprite, endColor: number, time: number, callback?: () => void) {
        this.tweens.add({
            targets: sprite,
            duration: time/2,
            tint: endColor,
            yoyo: true,
            repeat: 1,
            onComplete: callback 
        });
    }      


    protected createItems(){
        let value: number = 0;
        for (let index = 0; index < 6; index++) {
            if(value < 3){
                const element = new ObjectCoollectible(this,this.posicionesItems[index].x,this.posicionesItems[index].y,this.itemsType[value]);
                this.add.existing(element);
                this.items.push(element);
                value++;
            }else{
                index--;
                value = 0;
            }
        }
    }

    protected createGameOver() {
        this.gameOverScreen = document.createElement('div');
        this.gameOverScreen.id = 'gameOverScreen';
        this.gameOverScreen.style.position = 'absolute';
        this.gameOverScreen.style.top = '124px';
        this.gameOverScreen.style.left = '296px';
        this.gameOverScreen.style.width = '900px';
        this.gameOverScreen.style.height = '630px';
        this.gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.gameOverScreen.style.color = '#fff';
        this.gameOverScreen.style.display = 'flex';
        this.gameOverScreen.style.justifyContent = 'center';
        this.gameOverScreen.style.alignItems = 'center';

        const content = document.createElement('div');
        content.style.textAlign = 'center';

        const gameOverText = document.createElement('h1');
        gameOverText.textContent = 'Game Over';
        gameOverText.style.fontSize = '3em';
        gameOverText.style.marginBottom = '20px';

        const backButton = document.createElement('button');
        backButton.textContent = 'Salir de la partida';
        backButton.style.padding = '10px 20px';
        backButton.style.fontSize = '1.2em';
        backButton.style.backgroundColor = '#333';
        backButton.style.color = '#fff';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.addEventListener('click', () => {
            this.socket.disconnect();
            window.location.href = '/';
        });

        content.appendChild(gameOverText);
        content.appendChild(backButton);
        this.gameOverScreen.appendChild(content);
    }

    protected gameOver() {
        document.body.appendChild(this.gameOverScreen);
        this.player.setVelocity(0, 0);
        this.isKnockedDown = true;
        this.player.anims.play('dead');
        this.player.anims.stopAfterRepeat(0);
        this.player.setStatic(true);
        this.gameOverScreen.style.display = 'flex'; 
    }

    protected collectItem(item: any){
        item.destroy();
        if(this.items.length==0){
            this.socket.emit("changeLevel",{
                mapaActual: '',
                idOwner:this.socket.id
            });
        }
    }
}   