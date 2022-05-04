import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import MODEL from './girl.gltf';

class Girl extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'Girl';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        
    }
}

export default Girl;