import { right } from '@popperjs/core';
import { MainScene } from './MainScene';
import { ObjectCoollectible } from '../objects/objectCoollectible';
import { ScoreBoard } from '../objects/scoreBoard';
import { DesertScene } from './DesertScene';

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

export class CavernaScene extends DesertScene {
    constructor(key: string, socket: any, code: string) {
        super(key, socket, code);
    }

    override init(data: any) {
        super.init(data);
    }

    override preload() {
        super.preload();
        this.load.tilemapTiledJSON('caverna', 'assets/backgrounds/caverna.json');
        this.load.image('caverna', 'assets/backgrounds/caverna.png');
        this.load.audio('cavernaMusic', 'assets/music/cavernaMusic.ogg');
        this.load.spritesheet("Skeleton", "assets/characters/Skeleton.png", {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    override create() {
        var caverna;
        const music = this.sound.add('cavernaMusic', { loop: true });
        const { width, height } = this.sys.game.canvas;
        music.play();
        super.create_mapa(width, height + 380, 'caverna', 'caverna', 'caverna', ['Capa de patrones 1'],caverna);
        super.create_player(width, height + 380,470.87098553608377, 191.45387158490442, 'player');
        this.createLifeBar();
        this.createGameOver();
        this.create_remote_players();
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
            });
        });

        this.tweens.add({
            targets: this.cameras.main,
            alpha: 1,
            duration: 2000,
            onComplete: () => {}
        });
    }

    protected override changeSkeletonDirection(skeleton: Phaser.Physics.Matter.Sprite) {
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

    protected override create_skeleton ( position_x: number, position_y: number, spray: string) {
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

    protected override createSkeletons() {
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

    
    protected override createLifeBar() {
        this.heartsGroup = this.add.group();
        for (let i = 0; i < 5; i++) {
            const heart = this.add.image(300 + i * 20, 210, 'corazon').setScrollFactor(0);
            this.heartsGroup.add(heart);
        }
    }

    protected override create_animationSkeleton() {
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
        super.update();

    }
    
    protected override checkDistance(bodyA: Phaser.Physics.Matter.Sprite, bodyB: Phaser.Physics.Matter.Sprite) {
        const distance = Phaser.Math.Distance.Between(bodyA.x, bodyA.y, bodyB.x, bodyB.y);
        return distance < 50 ;
    }

    protected override chequearColisionRemota(skeleton: Phaser.Physics.Matter.Sprite, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): boolean {
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
    
    protected override matarEsqueleto( index: number) {
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

    protected override getTurn(myNumber: number) {
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
    
    protected override updateSkeleton(data: any) {
        const skeletonToUpdate = this.skeletonsGroup[data.index];
        if (skeletonToUpdate) {
            skeletonToUpdate.setVelocityX(data.velocityX)
            skeletonToUpdate.setVelocityY(data.velocityY)
            skeletonToUpdate.setTint(data.color);
        }
    }

    protected override reduceLife() {
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

    protected override updateLifeBar() {
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
    protected override tweenTint(sprite: Phaser.GameObjects.Sprite, endColor: number, time: number, callback?: () => void) {
        this.tweens.add({
            targets: sprite,
            duration: time/2,
            tint: endColor,
            yoyo: true,
            repeat: 1,
            onComplete: callback 
        });
    }      

    protected override createItems(){
        for (let index = 0; index < 6; index++) {
            for (let num = 0;num < 3; num++) {
                const element = new ObjectCoollectible(this,this.posicionesItems[index].x,this.posicionesItems[index].y,this.itemsType[num]);
                this.add.existing(element);
                this.items.push(element);
            }
        }
    }

    protected override createGameOver() {
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

    protected override gameOver() {
        document.body.appendChild(this.gameOverScreen);
        this.player.setVelocity(0, 0);
        this.isKnockedDown = true;
        this.player.anims.play('dead');
        this.player.anims.stopAfterRepeat(0);
        this.player.setStatic(true);
        this.gameOverScreen.style.display = 'flex'; 
    }
}   