import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './hjewelers.gltf';

class HJewelers extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'hjewelers';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
    }
}

export default HJewelers;
