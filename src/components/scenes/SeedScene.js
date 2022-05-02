import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land, Starbucks, HJewelers, Trashcan, Bench } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        // this.background = new Color(0x7ec0ee);
        this.background = new Color(0xcd8abf);

        // Add meshes to scene
        const land = new Land();
        const flower = new Flower(this);
        const lights = new BasicLights();
        const starbucks = new Starbucks();
        const hjewelers = new HJewelers();
        const trashcan = new Trashcan();
        const bench = new Bench();
        this.add(lights, starbucks);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
