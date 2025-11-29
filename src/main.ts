import * as THREE from "three";
import { AxisGrid } from "./objects/AxisGrid";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SegmentController } from "./objects/SegmentController";

// Canvas
const canvas = document.querySelector("#app") as HTMLElement;

// Program values
const segmentLength = 1;
let maxSegments = 22;
const color = 0x7CFC00;

let numOfConfigurations = 1;
let numOfCircles = 0;

// Slider
const slider = document.getElementById("segmentsSlider") as HTMLInputElement;
const sliderValue = document.getElementById("segmentsValue")!;

// Legend update
const updateLegend = () => {
  const legend = document.getElementById("legend")!;
  const ratio = numOfCircles / numOfConfigurations;
  const estimatedValidConfigs = ratio * Math.pow(3, maxSegments);

  legend.innerHTML = `
    <h3>Segment Controller</h3>
    <p>This visualizes connected segments in 3D.</p>
    <p><strong>(n):</strong> ${maxSegments}</p>
    <p><strong>Configurations drawn:</strong> ${numOfConfigurations}</p>
    <p><strong>Circles detected:</strong> ${numOfCircles}</p>
    <p><strong>Ratio:</strong> ${(ratio * 100).toFixed(9)}%</p>
    <p><strong>Estimated valid configurations:</strong> ${estimatedValidConfigs.toLocaleString("en-US")}</p>
  `;
};

updateLegend();

// Scene setup
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.z = 3;
camera.position.x = -10;
camera.position.y = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = false;

new OrbitControls(camera, renderer.domElement);

// Objects
const axis = new AxisGrid(maxSegments, 1, 0x444444);
scene.add(axis);

const segmentControl = new SegmentController(segmentLength, color, maxSegments);
scene.add(segmentControl);

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Interval-based generator
let interval: number;

const startGenerating = () => {
  clearInterval(interval);

  interval = window.setInterval(() => {
    for (let i = 0; i < 1000; i++) {
      segmentControl.addSegment();
    }

    numOfConfigurations = segmentControl.numOfConfigurations;
    numOfCircles = segmentControl.numOfCircles;

    updateLegend();
  }, 0);
};

startGenerating();

// Slider event
slider.addEventListener("input", () => {
  maxSegments = parseInt(slider.value, 10);
  sliderValue.textContent = slider.value;

  // Update objects
  segmentControl.setMaxSegments(maxSegments);
  axis.setSegments(maxSegments);

  updateLegend();
  startGenerating();
});

// Animation loop
const rotationSpeed = 0.005;

const tick = () => {
  segmentControl.rotation.y += rotationSpeed;
  axis.rotation.y += rotationSpeed;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();

