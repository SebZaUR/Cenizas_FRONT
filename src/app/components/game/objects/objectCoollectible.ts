export class objectCoollectible extends Phaser.GameObjects.Sprite{
    constructor(scene : Phaser.Scene,x: number, y: number, texture :string){
        super (scene, x ,y ,texture);
        this.setOrigin(0.5,0.5);
        this.setDisplaySize(16,16);
        this.setSize(32,32);
        this.setInteractive();
        scene.add.existing(this);
        }

    collectItem(item: objectCoollectible) {
        item.destroy(); 
    }
}