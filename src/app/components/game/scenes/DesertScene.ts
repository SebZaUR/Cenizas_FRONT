import { MainScene } from './MainScene';

export class DesertScene extends MainScene {

    protected override startx: number = 170;
    protected override starty: number = 270;

    constructor(key: string, socket: any) {
        super(key, socket);
    }

    override init(data: any) {
        this.socket.connect();
        this.socket.id = data.socketId;
        this.socket.on('connect', () => {
            if (this.socket.id) {
                this.socket.off('firstPlayer');
                this.playerId = this.socket.id; 
                data.players.forEach((player: { id: string; posx: number; posy: number; }) => {
                    if (player.id === this.socket.id) {
                        this.startx = player.posx;
                        this.starty = player.posy;
                    }
                });       
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
    }

    override create() {
        const music = this.sound.add('desertMusic', { loop: true });
        const { width, height } = this.sys.game.canvas;
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.display = 'none';
        }
        var desert;
        music.play();
        super.create_mapa(width, height + 380, 'first', 'desert', 'desert', ['suelo','objetos','solidos'],desert);
        super.create_player(width, height + 380, this.startx, this.starty, 'player');
        super.create_remote_players();
        this.cameras.main.setAlpha(0);
        this.tweens.add({
            targets: this.cameras.main,
            alpha: 1,
            duration: 2000,
            onComplete: () => {}
        });
    }
}