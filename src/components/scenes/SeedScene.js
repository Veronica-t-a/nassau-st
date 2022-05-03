import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { CubeTextureLoader, sRGBEncoding } from 'three';
import { Land, Starbucks, Landau, Tacoria, Ustore, Labyrinth, Trashcan, Bench, Tree } from 'objects';
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
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const land = new Land();
        const lights = new BasicLights();
        const starbucks = new Starbucks();
        const landau = new Landau();
        const tacoria = new Tacoria();
        const ustore = new Ustore();
        const labyrinth = new Labyrinth();
        const trashcan = new Trashcan();
        const bench = new Bench();
        const tree = new Tree();
        this.add(lights, land, starbucks, landau, tacoria, ustore, labyrinth, trashcan, bench, tree);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
