export class ObjectCoollectible extends Phaser.Physics.Matter.Sprite {
    private itemType : string = "";
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene.matter.world, x, y, texture);
        this.itemType = texture;
        scene.add.existing(this); // Añade el sprite al escenario
        this.setOrigin(0.5, 0.5);
        this.setDisplaySize(16, 16);
        this.setSize(32, 32);
        this.setInteractive(); // Establece la interactividad (si es necesaria)
    }
}
