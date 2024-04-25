import { DesertScene } from "./DesertScene";

export class CavernaScene extends DesertScene {
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
        this.load.tilemapTiledJSON('first', 'assets/backgrounds/caverna.json');
        this.load.image('caverna', 'assets/backgrounds/caverna.png');
        this.load.audio('cavernaMusic', 'assets/music/cavernaMusic.ogg');
    }
    override create() {
        var caverna;
        const music = this.sound.add('cavernaMusic', { loop: true });
        const { width, height } = this.sys.game.canvas;
        music.play();
        super.create_mapa(width, height + 380, 'first', 'caverna', 'caverna', ['solido','pasillo','basura','suelo'],caverna);
        super.create_player(width, height + 380, this.startx, this.starty, 'player');
        this.cameras.main.setAlpha(0);
        this.tweens.add({
            targets: this.cameras.main,
            alpha: 1,
            duration: 2000,
            onComplete: () => {}
        });
    }
}