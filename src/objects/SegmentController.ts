import * as THREE from "three";

type Direction = "x" | "y" | "z";

export class SegmentController extends THREE.Group {
  private segmentLength: number;
  private color: number;
  private maxSegments: number;

  private prevSegmentEnd: THREE.Vector3 | null = null;
  private prevDirection: Direction | null = null;

  private lineSegments: THREE.LineSegments;
  private positions: Float32Array;
  private positionIndex = 0;

  public numOfSegments = 0;
  public numOfConfigurations = 0;
  public numOfCircles = 0;

  constructor(segmentLength = 1, color = 0xff0000, maxSegments = 100) {
    super();

    this.segmentLength = segmentLength;
    this.color = color;
    this.maxSegments = maxSegments;

    // Preallocate buffer: 2 points per segment, 3 coords per point
    this.positions = new Float32Array(maxSegments * 2 * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));

    const material = new THREE.LineBasicMaterial({ color: this.color });
    this.lineSegments = new THREE.LineSegments(geometry, material);
    this.add(this.lineSegments);
  }

  addSegment() {
    if (this.numOfSegments >= this.maxSegments) {
      // Completed one configuration
      this.numOfConfigurations += 1;

      const end = this.prevSegmentEnd ?? new THREE.Vector3();
      if (end.x === 0 && end.y === 0 && end.z === 0) {
        this.numOfCircles += 1;
      }

      // Reset for next configuration
      this.numOfSegments = 0;
      this.positionIndex = 0;
      this.prevSegmentEnd = null;
      this.prevDirection = null;
    }

    this.numOfSegments += 1;

    const start = this.prevSegmentEnd ? this.prevSegmentEnd.clone() : new THREE.Vector3();

    // Determine direction
    let direction: Direction;
    if (!this.prevDirection) {
      const options: Direction[] = ["x", "z"];
      direction = options[Math.floor(Math.random() * options.length)];
    } else {
      const orthogonalAxes: Direction[] = ["x", "y", "z"].filter(d => d !== this.prevDirection);
      const choices = [this.prevDirection, ...orthogonalAxes];
      direction = choices[Math.floor(Math.random() * choices.length)];
    }

    // Determine end point
    const end = start.clone();
    const delta = this.segmentLength;

    if (direction === this.prevDirection) {
      end[direction] += delta; // forward only
    } else {
      end[direction] += Math.random() < 0.5 ? delta : -delta; // orthogonal
    }

    // Write positions to buffer
    const idx = this.positionIndex * 6; // 2 points * 3 coords
    this.positions[idx] = start.x;
    this.positions[idx + 1] = start.y;
    this.positions[idx + 2] = start.z;
    this.positions[idx + 3] = end.x;
    this.positions[idx + 4] = end.y;
    this.positions[idx + 5] = end.z;

    this.positionIndex += 1;

    // Notify Three.js that positions changed
    (this.lineSegments.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Update tip and direction
    this.prevSegmentEnd = end.clone();
    this.prevDirection = direction;
  }
}

