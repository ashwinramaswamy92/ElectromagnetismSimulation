// js/main.js
import * as THREE from 'three';
// import { OrbitControls } from 'three-orbitcontrols';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"   //Used for camera movement


//------------------PARAMETERS---------------------------//

let objectMoveSensitivity = 0.01;


//------------------ FUNCTIONS---------------------------//


// Function to create magnetic field lines
const createMagneticFieldLines = (magnet, numLines) => {
    const lines = new THREE.Group();

    for (let i = 0; i < numLines; i++) {
        const t = (i / numLines) * Math.PI * 2;
        const x = magnet.position.x + magnetLength / 2 * Math.sin(t);
        const y = magnet.position.y + magnetHeight / 2 * Math.cos(t);
        const z = magnet.position.z + magnetLength / 2 * Math.cos(t);

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([magnet.position, new THREE.Vector3(x, y, z)]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3333ff });

        const line = new THREE.Line(lineGeometry, lineMaterial);
        lines.add(line);
    }

    return lines;
};



//-------------------------- SETUP -------------------------------------------------//

// Set up scene
const scene = new THREE.Scene();

// Set up camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
// Set up renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(640, 480);  // Increase the size as desired
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Set up directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-2, 5, 2);
scene.add(directionalLight);


// // Set up OrbitControls (for camera movement)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Setting up Keyboard-modulated control of object

// Variable to track whether the space bar is pressed
let spaceBarPressed = false;

// Event listeners for keydown and keyup events 
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        spaceBarPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        spaceBarPressed = false;
    }
});

//Event listeners for mouse presses:

// Variable to track mouse interactions -> For non-orbit based control, here for controlling the magnet
let isLeftMouseDown = false;
let isRightMouseDown = false;
let isMiddleMouseDown = false;

// Event listeners for mouse down and up events
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        isLeftMouseDown = true;
    } else if (event.button === 2) {
        isRightMouseDown = true;
    } else if (event.button == 1){
        isMiddleMouseDown = true;
    }
});

document.addEventListener('mouseup', () => {
    isLeftMouseDown = false;
    isRightMouseDown = false;
    isMiddleMouseDown = false;
});

//Prevent default action from right click
window.addEventListener("contextmenu", e => e.preventDefault());


// Event listener for mouse move
document.addEventListener('mousemove', (event) => {
    if (spaceBarPressed && isLeftMouseDown) {
        // Rotate the bar magnet
        barMagnet.rotation.x += event.movementY * objectMoveSensitivity;
        barMagnet.rotation.y += event.movementX * objectMoveSensitivity;
    } else if (spaceBarPressed && isRightMouseDown) {
        // Translate the bar magnet
        barMagnet.position.x += event.movementX * objectMoveSensitivity;
        barMagnet.position.y -= event.movementY * objectMoveSensitivity; // Invert Y for intuitive movement
    } else if(spaceBarPressed && isMiddleMouseDown) {

        //TODO (possibly very complicated): determining sign of rotation by derivative of rotation

        //Simple middle click rotation:
        barMagnet.rotation.z += (Math.abs(event.movementX) + Math.abs(event.movementY)) * objectMoveSensitivity;
    }

});



//------------------------------ SCENE OBJECTS ----------------------------------------//

//Add Grid to scene
const gridSize = 10;
const gridDivisions = 10;
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xffffff, 0x888888);
// gridHelper.position.y = -0.1;
// gridHelper.rotation.x = Math.PI / 2; // Rotate the grid to be aligned with the XY plane
scene.add(gridHelper);

// Set up bar magnet with distinct polarities
const magnetStrength = 1;
const magnetLength = 3;
const magnetWidth = 0.5;
const magnetHeight = 0.2;

const northPoleGeometry = new THREE.BoxGeometry(magnetWidth, magnetHeight, magnetLength / 2);
const southPoleGeometry = new THREE.BoxGeometry(magnetWidth, magnetHeight, magnetLength / 2);

//Set up materials with shadows
const northPoleMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000, emissive: 0x770000, shininess: 30 });
const southPoleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000FF, emissive: 0x000077, shininess: 30 });

northPoleMaterial.receiveShadow = true;
northPoleMaterial.castShadow = true;

southPoleMaterial.receiveShadow = true;
southPoleMaterial.castShadow = true;

const northPole = new THREE.Mesh(northPoleGeometry, northPoleMaterial);
const southPole = new THREE.Mesh(southPoleGeometry, southPoleMaterial);

// Position the poles end to end
northPole.position.z = magnetLength / 4;
southPole.position.z = -magnetLength / 4;

const barMagnet = new THREE.Group();
barMagnet.add(northPole);
barMagnet.add(southPole);

scene.add(barMagnet);


// Create magnetic field lines
// const magneticFieldLines = createMagneticFieldLines(barMagnet, 100);
// scene.add(magneticFieldLines);




// Animation loop
const animate = () => {
    requestAnimationFrame(animate);

    //Disable orbit controls
    if(!spaceBarPressed){
        controls.enabled = true;
    }
    else{
        controls.enabled = false;
    }
    
    renderer.render(scene, camera);
};

// Start animation loop
animate();


