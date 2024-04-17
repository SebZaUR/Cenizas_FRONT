import { right } from '@popperjs/core';
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
    private hitTimer!: Phaser.Time.TimerEvent;

    private heartsGroup!: Phaser.GameObjects.Group;
    private cantidadVida: number = 100;
    private golpePorCorazon: number = 20;
    private isHit: boolean = false;
    private skeletonsGroup: Phaser.Physics.Matter.Sprite[] = [];
    private skeletonDirections: { skeleton: Phaser.Physics.Matter.Sprite, direction: Direction }[] = [];
    private skeletosnLife: number[] = []; // Array para almacenar la vida de cada esqueleto
    private skeletonsHitted: boolean[] = []; // Array para rastrear si cada esqueleto ha sido golpeado recientemente
    private skeletonHitted: boolean =false;
    private skeletonSpeed = 0.7; 
    private cantidadVidaEnemigo: number = 500;
    private golpePorespada: number = 30;
    
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
      
    }

    override create() {
        const music = this.sound.add('desertMusic', { loop: true });
        const { width, height } = this.sys.game.canvas;
        var desert;
        music.play();
        super.create_mapa(width, height + 380, 'first', 'desert', 'desert', ['suelo','objetos','solidos'],desert);
        super.create_player(width, height + 380, this.startx, this.starty, 'player');
        this.createLifeBar();
        this.create_remote_players();
        this.cameras.main.setAlpha(0);
        this.create_animationSkeleton();
        this.createSkeletons();
        this.matter.world.on('collisionstart', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
        
                this.skeletonsGroup.forEach((skeleton) => {
                    if (bodyA === skeleton.body || bodyB === skeleton.body) {
                        this.changeSkeletonDirection(skeleton);
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

    private changeSkeletonDirection(skeleton: Phaser.Physics.Matter.Sprite) {
        const index = this.skeletonDirections.findIndex(item => item.skeleton === skeleton);
        console.log(this.skeletonDirections);
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
        }else{
            console.log("Arreglo mal");
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

    private createSkeletons() {
        const numSkeletons = 7; 
        console.log(this.skeletonsGroup);
        for (let i = 0; i < numSkeletons; i++) {
            const posX = Phaser.Math.Between(100, 700); 
            const posY = Phaser.Math.Between(100, 500); 
            const skeleton = this.create_skeleton(posX, posY, 'Skeleton');
            this.skeletonsGroup.push(skeleton);
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

    create_animationSkeleton() {
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
    
        this.skeletonDirections.forEach(skeletonObj  => {
            const skeleton = skeletonObj.skeleton;
            const direction = skeletonObj.direction;
            const speed = this.skeletonSpeed;

            switch (direction) {
                case Direction.UP:
                    skeleton.setVelocity(0, -speed);
                    break;
                case Direction.DOWN: 
                    skeleton.setVelocity(0, speed);
                    break;
                case Direction.LEFT:
                    skeleton.setFlipX(true);
                    skeleton.setVelocity(-speed, 0);
                    break;
                case Direction.RIGHT:
                    skeleton.setVelocity(speed, 0);
                    skeleton.setFlipX(false);
                    break;
            }
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
    
            this.socket.emit('updateSkeleton', {
                x: skeleton.x,
                y: skeleton.y,
                animation: skeleton.anims.currentAnim,
                key: skeleton.anims.currentAnim?.key,
                color: skeleton.tint,
                code: this.code
            });
        });
    
        this.matter.world.on('collisionstart', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
    
                this.skeletonsGroup.forEach(skeleton => {
                    if (this.cantidadVidaEnemigo >= 0 && bodyA === this.player.body && bodyB === skeleton.body) {
                        this.reduceLife();
                    }
                });
            });
        });
    }
    
    private checkDistance(bodyA: Phaser.Physics.Matter.Sprite, bodyB: Phaser.Physics.Matter.Sprite) {
        const distance = Phaser.Math.Distance.Between(bodyA.x, bodyA.y, bodyB.x, bodyB.y);
        return distance < 50 ;
    }

    private getTurn(myNumber: number) {
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
    
    private updateSkeleton(data: any){
        //this.skeleton.x = data.x;
        //this.skeleton.y = data.y;
        //this.skeleton.setTint(data.color);
    }

    private reduceLife() {
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

    private updateLifeBar() {
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
    private tweenTint(sprite: Phaser.GameObjects.Sprite, endColor: number, time: number, callback?: () => void) {
        this.tweens.add({
            targets: sprite,
            duration: time/2,
            tint: endColor,
            yoyo: true,
            repeat: 1,
            onComplete: callback 
        });
    }    
}   