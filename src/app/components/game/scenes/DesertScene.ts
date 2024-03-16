import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import { MainScene } from './MainScene';

export class DesertScene extends MainScene {
    protected override startx: number = 160;
    protected override starty: number = 250;
    protected override otherSprites: { [playerId: string]: Phaser.Physics.Matter.Sprite } = {};
    protected override playerVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    protected override socket!: Socket;

    constructor(socket: any) {
        super('DesertScene', socket);
    }

    override init(data: any) {
        this.otherSprites = data.otherSprites;
        super.init(data);
    }

    override preload() {
        this.load.spritesheet("player", "assets/characters/player.png", {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.tilemapTiledJSON('first', 'assets/backgrounds/desert.json');
        this.load.image('desert', 'assets/backgrounds/desert.png');
        this.load.audio('desertMusic', 'assets/music/desertMusic.ogg');
    }

    override create() {
        const { width, height } = this.sys.game.canvas;
        const music = this.sound.add('desertMusic', { loop: true });
        music.play();
        this.create_mapa(width, height + 380, 'first', 'desert', 'desert');
        super.create_player(width, height + 380, this.startx, this.starty, 'player');
        super.create_remote_players();
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.display = 'none';
        }
        this.cameras.main.setAlpha(0);
        this.tweens.add({
            targets: this.cameras.main,
            alpha: 1,
            duration: 2000,
            onComplete: () => {}
        });
    }

    override create_mapa(width: number, height: number, key: string, tileImage: string, tileSet: string) {
        const mapa = this.make.tilemap({ key: key });
        const desert = mapa.addTilesetImage(tileImage, tileSet);
        if (desert !== null) {
            mapa.createLayer('suelo', desert);
            const objetos = mapa.createLayer('objetos', desert);
            const solidos = mapa.createLayer('solidos', desert);
            if (solidos) {
                solidos.setCollisionByProperty({ pared: true });
                this.matter.world.convertTilemapLayer(solidos);
            }
            if (objetos) {
                objetos.setCollisionByProperty({ pared: true });
                this.matter.world.convertTilemapLayer(objetos);
            }
        }
    }
}
