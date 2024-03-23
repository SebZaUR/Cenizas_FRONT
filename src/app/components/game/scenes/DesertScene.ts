import { right } from '@popperjs/core';
import { MainScene } from './MainScene';
 enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
 };
export class DesertScene extends MainScene {
    private directionskeleton = Direction.LEFT ;
    protected override startx!: number;
    protected override starty: number = 270;
    protected skeleton!: Phaser.Physics.Matter.Sprite;
    
    constructor(key: string, socket: any) {
        super(key, socket);
    }

    override init(data: any) {
        this.socket.connect();
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
        this.barraVida = this.add.image(330, 210, 'vida').setScrollFactor(0);
        this.create_remote_players();
        this.cameras.main.setAlpha(0);
        this.create_animationSkeleton();
        this.create_skeleton(400, 400, 'Skeleton');
        this.skeleton.anims.play('caminar');
        this.matter.world.on('collisionstart', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
        
                if (bodyA === this.skeleton.body || bodyB === this.skeleton.body) {
                    this.changeSkeletonDirection();
                }
            });
        });

        this.tweens.add({
            targets: this.cameras.main,
            alpha: 1,
            duration: 2000,
            onComplete: () => {}
        });
    }

private changeSkeletonDirection() {
    const randomDirection = Phaser.Math.Between(0, 3);

    switch(randomDirection) {
        case 0:
            this.directionskeleton = Direction.UP;
            break;
        case 1:
            this.directionskeleton = Direction.DOWN;
            break;
        case 2:
            this.directionskeleton = Direction.LEFT;
            break;
        case 3:
            this.directionskeleton = Direction.RIGHT;
            break;
        default:
            break;
    }
}

    protected create_skeleton ( position_x: number, position_y: number, spray: string) {
        this.skeleton = this.matter.add.sprite(position_x, position_y, spray);
        this.skeleton.setDisplaySize(90, 90);
        this.skeleton.setRectangle(35, 50);
        this.skeleton.setOrigin(0.50, 0.50);
        this.skeleton.setFixedRotation();
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
            key: this.player.anims.currentAnim?.key
        });
       
        await new Promise(resolve => setTimeout(resolve, 250));
        super.create_remote_players();
    }

    override  update() {
        const startButton = document.getElementById('startButton');
        if (startButton && startButton.parentNode) {
            startButton.parentNode.removeChild(startButton);
        }
        super.update();
        this.socket.on('updateSkeleton', (skeletonData) => {
            this.updateSkeleton(skeletonData);
        });

        const speed = 0.7;
        switch(this.directionskeleton){
            case Direction.UP:  
                this.skeleton.setVelocity(0,-speed)
                break
            case Direction.DOWN:
                this.skeleton.setVelocity(0,speed)
                break
            case Direction.LEFT:
                this.skeleton.setFlipX(true);
                this.skeleton.setVelocity(-speed,0)
                break
            case Direction.RIGHT:
                this.skeleton.setVelocity(speed,0)
                this.skeleton.setFlipX(false);

                break
        }
        
        if (this.isAttacking) {
            this.skeleton.setTint(0xff0000); 
        } else {
            this.skeleton.clearTint();
        }

        this.socket.emit('updateSkeleton',{
            x: this.skeleton.x,
            y: this.skeleton.y,
            animation: this.skeleton.anims.currentAnim,
            key: this.skeleton.anims.currentAnim?.key
        })
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
        this.skeleton.x = data.x;
        this.skeleton.y = data.y;
    }
}