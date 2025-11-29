import * as THREE from "three";
import { AxisGrid } from "./objects/AxisGrid";


//import camare cntrols
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SegmentController } from "./objects/SegmentController";
// Canvas
const canvas = document.querySelector("#app");


// Legend element
const segmentLength = 1;
const maxSegments = 10;
const color = 0x7CFC00;
let numOfConfigurations = 1;
let numOfCircles = 0;


const updateLegend = () => {
  const legend = document.getElementById("legend")!;

  // Inject program values
  legend.innerHTML = `
  <h3>Segment Controller</h3>
  <p>This visualizes connected segments in 3D.</p>
  <p><strong>(n):</strong> ${maxSegments}</p>
  <p><strong>Configurations drawn:</strong> ${numOfConfigurations}</p>
  <p><strong>Circles detected</strong> ${numOfCircles}</p>
  <p><strong>Ratio</strong> ${((numOfCircles / numOfConfigurations) * 100).toFixed(9)}%</p>
`;
}


updateLegend();
const p = document.createElement("canvas");
const gl = p.getContext("webgl");
console.log("RENDERER:", gl.getParameter(gl.RENDERER));
console.log("VENDOR:", gl.getParameter(gl.VENDOR));
console.log("UNMASKED RENDERER:", gl.getExtension("WEBGL_debug_renderer_info")?.UNMASKED_RENDERER_WEBGL);
console.log("UNMASKED VENDOR:", gl.getExtension("WEBGL_debug_renderer_info")?.UNMASKED_VENDOR_WEBGL);
// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = false;
const controls = new OrbitControls(camera, renderer.domElement);


const axis = new AxisGrid(maxSegments, 1, 0x444444);

const segmentControl = new SegmentController(segmentLength, color, maxSegments);
scene.add(segmentControl);


scene.add(axis);

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


const handleRandomSegments = () => {
  setInterval(() => {
    for (let i = 0; i < maxSegments * 5;i++) {
      segmentControl.addSegment();
    }

    numOfConfigurations = segmentControl.numOfConfigurations;
    numOfCircles = segmentControl.numOfCircles;

    updateLegend();

  }, 0 )
}


handleRandomSegments()

// Animation loop
const tick = () => {

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();

