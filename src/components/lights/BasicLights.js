import { Group, SpotLight, AmbientLight, HemisphereLight, DirectionalLight } from 'three';
// import { Group, SpotLight, AmbientLight, HemisphereLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        const dir = new SpotLight(0xffffff, 1.6, 7, 0.8, 1, 1);
        const ambi = new AmbientLight(0x404040, 1.32);
        // const hemi = new HemisphereLight(0xffffbb, 0x080820, 2.3);

        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_hemisphere.html
        const dl = new DirectionalLight( 0xffffff, 1 );
				dl.color.setHSL( 0.1, 1, 0.95 );
				dl.position.set( - 1, 1.75, 1 );
				dl.position.multiplyScalar( 30 );

				dl.castShadow = true;

				dl.shadow.mapSize.width = 2048;
				dl.shadow.mapSize.height = 2048;
        const hemi = new HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemi.color.setHSL( 0.6, 1, 0.6 );
				hemi.groundColor.setHSL( 0.095, 1, 0.75 );
				hemi.position.set( 0, 50, 0 );

        // dir.position.set(5, 1, 2);
        // dir.target.position.set(0, 0, 0);

        // this.add(ambi, hemi, dir, dl);
        this.add(ambi, hemi, dl);
    }
}

export default BasicLights;
