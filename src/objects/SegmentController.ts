import * as THREE from "three";

type Direction = "x" | "y" | "z";

export class SegmentController extends THREE.Group {
  private segmentLength: number;
  private color: number;
  private maxSegments: number;

  private prevSegmentEnd: THREE.Vector3 | null = null;
  private prevDirection: Direction | null = null;

  private currentSegments: THREE.Line[] = [];   // active run
  private lastCircleGroup: THREE.Group | null = null; // persistent circle (pink)

  public numOfSegments = 0;
  public numOfConfigurations = 0;
  public numOfCircles = 0;

  constructor(segmentLength = 1, color = 0x00ff00, maxSegments = 100) {
    super();
    this.segmentLength = segmentLength;
    this.color = color;
    this.maxSegments = maxSegments;
  }

  private makeLine(start: THREE.Vector3, end: THREE.Vector3, color: number) {
    const mat = new THREE.LineBasicMaterial({ color });
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    return new THREE.Line(geo, mat);
  }

  private clearCurrentSegments() {
    for (const line of this.currentSegments) {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
      this.remove(line);
    }
    this.currentSegments = [];
  }

  private saveLastCircle() {
    // remove previous saved circle
    if (this.lastCircleGroup) {
      this.lastCircleGroup.children.forEach(c => {
        (c as any).geometry.dispose();
        (c as any).material.dispose();
      });
      this.remove(this.lastCircleGroup);
    }

    // create new pink group
    const group = new THREE.Group();

    for (const segment of this.currentSegments) {
      const start = (segment.geometry.attributes.position as any).array.slice(0, 3);
      const end = (segment.geometry.attributes.position as any).array.slice(3, 6);

      const s = new THREE.Vector3(start[0], start[1], start[2]);
      const e = new THREE.Vector3(end[0], end[1], end[2]);

      const pinkLine = this.makeLine(s, e, 0xff00aa); // PINK
      group.add(pinkLine);
    }

    this.lastCircleGroup = group;
    this.add(group);
  }

  private resetRun() {
    this.prevSegmentEnd = null;
    this.prevDirection = null;
    this.numOfSegments = 0;
    this.clearCurrentSegments();
  }

  addSegment() {
    if (this.numOfSegments >= this.maxSegments) {
      this.numOfConfigurations++;

      const end = this.prevSegmentEnd ?? new THREE.Vector3();

      // 👉 Circle detected
      if (end.x === 0 && end.y === 0 && end.z === 0) {
        this.numOfCircles++;
        this.saveLastCircle(); // store FULL circle in pink
      }

      this.resetRun();
      return;
    }

    this.numOfSegments++;

    const start = this.prevSegmentEnd ? this.prevSegmentEnd.clone() : new THREE.Vector3();

    let direction: Direction;
    if (!this.prevDirection) {
      direction = ["x", "z"][Math.floor(Math.random() * 2)];
    } else {
      const ortho = ["x", "y", "z"].filter(d => d !== this.prevDirection);
      direction = [this.prevDirection, ...ortho][Math.floor(Math.random() * 4)];
    }

    const end = start.clone();
    const delta = this.segmentLength;

    if (direction === this.prevDirection) {
      end[direction] += delta;
    } else {
      end[direction] += Math.random() < 0.5 ? delta : -delta;
    }

    // create visible line (GREEN)
    const line = this.makeLine(start, end, this.color);
    this.currentSegments.push(line);
    this.add(line);

    this.prevSegmentEnd = end.clone();
    this.prevDirection = direction;
  }
}

