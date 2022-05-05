import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './LastBuilding.gltf';

class LastBuilding extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'LastBuilding';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
    }
}

export default LastBuilding;
