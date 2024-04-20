import { right } from '@popperjs/core';
import { MainScene } from './MainScene';
import { objectCoollectible } from './objectCoollectible';
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
    private itemsType:  string[]= ["Llave","Herramienta","Metal"];
    private items: objectCoollectible[] = [];
    private posicionesItems: { x: number, y: number }[] = [];
    private posicionesInicialesEsqueletos: { x: number, y: number }[] = [];
    private skeletonsGroup: Phaser.Physics.Matter.Sprite[] = [];
    private skeletonDirections: { skeleton: Phaser.Physics.Matter.Sprite, direction: Direction }[] = [];
    private skeletosnLife: number[] = []; 
    private skeletonsHitted: boolean[] = []; 
    private skeletonHitted: boolean =false;
    private skeletonSpeed = 0.7; 
    private cantidadVidaEnemigo: number = 100;
    private golpePorespada: number = 30;
    private  count: number[] = [];
    
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
        this.posicionesInicialesEsqueletos = data.posicionesInicialesEsqueletos;
        this.posicionesItems = data.posicionesItems;
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
        this.createItems();
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
        const velocity = new Phaser.Math.Vector2();
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
    }
    
    private checkDistance(bodyA: Phaser.Physics.Matter.Sprite, bodyB: Phaser.Physics.Matter.Sprite) {
        const distance = Phaser.Math.Distance.Between(bodyA.x, bodyA.y, bodyB.x, bodyB.y);
        return distance < 50 ;
    }

    private chequearColisionRemota(skeleton: Phaser.Physics.Matter.Sprite, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): boolean {
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
    
    private matarEsqueleto( index: number) {
        const skeletonToUpdate = this.skeletonsGroup[index];
        this.count[index]+=1;      
        skeletonToUpdate.setVelocity(0, 0);
        skeletonToUpdate.anims.stop();
        skeletonToUpdate.anims.play('morido');
        skeletonToUpdate.anims.stopAfterRepeat(0);
        skeletonToUpdate.setStatic(true);
        this.time.delayedCall(1400, function() {
            skeletonToUpdate.setVisible(false);
            skeletonToUpdate.setSensor(true);
            skeletonToUpdate.setCollisionCategory(0);
        }, [], this);
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
    
    private updateSkeleton(data: any) {
        const skeletonToUpdate = this.skeletonsGroup[data.index];
        if (skeletonToUpdate) {
            skeletonToUpdate.setVelocityX(data.velocityX)
            skeletonToUpdate.setVelocityY(data.velocityY)
            skeletonToUpdate.setTint(data.color);
        }
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

    private createItems(){
        for (let index = 0; index < 6; index++) {
            for (let num = 0;num < 3; num++) {
                const element = new objectCoollectible(this,this.posicionesItems[index].x,this.posicionesItems[index].y,this.itemsType[num]);
                this.add.existing(element);
                this.items.push(element);
            }
        }
    }
}   