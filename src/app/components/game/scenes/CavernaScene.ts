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

}   