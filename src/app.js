/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */

// The character control code is adapted from the following tutorial: https://www.youtube.com/watch?v=EkPfhzIbp2g
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Swal from 'sweetalert2';
import GIRL from './components/objects/girl/Girl.gltf';
import WALK from './components/objects/girl/Walk.gltf';
import IDLE from './components/objects/girl/Idle.gltf';

let cam;
let globalScene;

class BasicCharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};

class BasicCharacterController {
  constructor(params) {
    this._Init(params);
  }

  _Init(params) {
    this._params = params;
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._velocity = new THREE.Vector3(0, 0, 0);

    this._animations = {};
    this._input = new BasicCharacterControllerInput();
    this._stateMachine = new CharacterFSM(
        new BasicCharacterControllerProxy(this._animations));

    this._LoadModels();
  }

  _LoadModels() {
    const loader = new GLTFLoader();
    loader.load(GIRL, (gltf) => {
      gltf.scene.scale.setScalar(3);
      gltf.scene.position.add(new THREE.Vector3(20, 0, 230))
      this._target = gltf.scene;
      this._params.scene.add(this._target);
      this._mixer = new THREE.AnimationMixer(this._target);
      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('idle');
      };
      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[anim.animations.length - 1];
        const action = this._mixer.clipAction(clip);
  
        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new GLTFLoader(this._manager);
      loader.load(WALK, (a) => { _OnLoad('walk', a); });
      loader.load(IDLE, (a) => { _OnLoad('idle', a); });
    });
  }

  // update avatar and camera position
  UpdatePosition(forward, sideways, controlObject) {
    let new_pos = controlObject.position.clone().add(forward).clone().add(sideways);
    if (new_pos.x >= -50 && new_pos.x <= 50 && new_pos.z >= -180 && new_pos.z <= 230) {
      controlObject.position.add(forward).clone().add(sideways);
      cam.position.add(forward).clone().add(sideways);
    }
  }

  Update(timeInSeconds) {
    if (!this._target) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this._input);

    // get and update acceleration
    const speed = globalScene.state['speed'];
    this._acceleration.z = speed;

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();

    if (this._input._keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    this.UpdatePosition(forward, sideways, controlObject);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
  }
};

class BasicCharacterControllerInput {
  constructor() {
    this._Init();    
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch(event.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
    }
  }
};


class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _AddState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;
    
    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
};


class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState('idle', IdleState);
    this._AddState('walk', WalkState);
  }
};

class State {
  constructor(parent) {
    this._parent = parent;
  }

  Enter() {}
  Update() {}
};

function enter(name, prevState, proxy) {
  const curAction = proxy._animations[name].action;
  if (prevState) {
    const prevAction = proxy._animations[prevState.Name].action;
    curAction.enabled = true;
    curAction.time = 0.0;
    curAction.setEffectiveTimeScale(1.0);
    curAction.setEffectiveWeight(1.0);
    curAction.crossFadeFrom(prevAction, 0.5, true);
    curAction.play();
  } else {
    curAction.play();
  }
}


class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'walk';
  }

  Enter(prevState) {
    enter('walk', prevState, this._parent._proxy);
  }

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      return;
    }

    this._parent.SetState('idle');
  }
};


class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'idle';
  }

  Enter(prevState) {
    enter('idle', prevState, this._parent._proxy)
  }

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      this._parent.SetState('walk');
    }
  }
};


class CharacterControllerDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.shadowMap.enabled = true;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(20, 10, 250);

    const scene = new SeedScene();
    this._scene = scene;
    globalScene = this._scene;

    cam = this._camera;
    const controls = new OrbitControls(
      cam, this._threejs.domElement);
    controls.target.set(0, 10, 0);
    controls.update();

    this._mixers = [];
    this._previousRAF = null;

    this._LoadAnimatedModel();
    this._RAF();
  }

  _LoadAnimatedModel() {
    const params = {
      camera: cam,
      scene: globalScene,
    }
    this._controls = new BasicCharacterController(params);
  }

  _OnWindowResize() {
    const { innerHeight, innerWidth } = window;
    this._threejs.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, cam);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }
}

Swal.fire({
  title: 'Welcome to A Walk Down Nassau Street!',
  showCancelButton: true,
  confirmButtonText: 'Next',
  cancelButtonText: 'Close',
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: 'Avatar Controls',
      html: 'To move the avatar, use the W (move forward), S (move backward), A (turn left), and D (turn right) keys',
      showCancelButton: true,
      confirmButtonText: 'Next',
      cancelButtonText: 'Close',
    }).then(() => {
      Swal.fire({
        title: 'Camera Controls',
        html: 'The camera will follow the avatar as it moves. You can move the camera using the up, down, left, and right arrow keys.',
        showCancelButton: true,
        confirmButtonText: 'Next',
        cancelButtonText: 'Close',
      }).then(() => {
        Swal.fire('Avatar Speed', 'You can control the avatar speed by adjusting the speed bar in the top right corner.').then(() => 
        {
          Swal.fire('You have completed the tutorial.')
        })
      })
    })
  }
})

let _APP = new CharacterControllerDemo();