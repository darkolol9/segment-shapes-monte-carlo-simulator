import * as THREE from "three";

type Direction = "x" | "y" | "z";

export class SegmentController extends THREE.Group {
  private segmentLength: number;
  private color: number;
  private maxSegments: number;

  private prevSegmentEnd: THREE.Vector3 | null = null;
  private prevDirection: Direction | null = null;

  private currentSegments: THREE.Line[] = [];
  private lastCircleGroup: THREE.Group | null = null;

  private visitedPoints = new Set<string>();
  private visitedEdges = new Set<string>();

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
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geo, mat);
  }

  private clearCurrentSegments() {
    for (const seg of this.currentSegments) {
      seg.geometry.dispose();
      (seg.material as THREE.Material).dispose();
      this.remove(seg);
    }
    this.currentSegments = [];
  }

  private saveLastCircle() {
    if (this.lastCircleGroup) {
      this.lastCircleGroup.children.forEach(obj => {
        (obj as any).geometry.dispose();
        (obj as any).material.dispose();
      });
      this.remove(this.lastCircleGroup);
    }

    const group = new THREE.Group();

    for (const seg of this.currentSegments) {
      const p = (seg.geometry.attributes.position as any).array;
      const s = new THREE.Vector3(p[0], p[1], p[2]);
      const e = new THREE.Vector3(p[3], p[4], p[5]);

      const pink = this.makeLine(s, e, 0xff00aa);
      group.add(pink);
    }

    this.lastCircleGroup = group;
    this.add(group);
  }

  private resetRun() {
    this.prevSegmentEnd = null;
    this.prevDirection = null;
    this.numOfSegments = 0;
    this.visitedPoints.clear();
    this.visitedEdges.clear();
    this.clearCurrentSegments();
  }

  private pointKey(v: THREE.Vector3) {
    return `${v.x},${v.y},${v.z}`;
  }

  private edgeKey(a: THREE.Vector3, b: THREE.Vector3) {
    return `${this.pointKey(a)}->${this.pointKey(b)}`;
  }

  addSegment() {
    if (this.numOfSegments >= this.maxSegments) {
      this.numOfConfigurations++;

      const end = this.prevSegmentEnd ?? new THREE.Vector3();

      // Only accept simple cycles
      const isSimpleCircle = (
        end.x === 0 && end.y === 0 && end.z === 0 &&
        this.currentSegments.length >= 3 && // at least triangle
        !this.hasSelfIntersection()
      );

      if (isSimpleCircle) {
        this.numOfCircles++;
        this.saveLastCircle();
      }

      this.resetRun();
      return;
    }

    this.numOfSegments++;

    const start = this.prevSegmentEnd ? this.prevSegmentEnd.clone() : new THREE.Vector3();

    // Direction choice
    let direction: Direction;
    if (!this.prevDirection) {
      direction = ["x", "z"][Math.floor(Math.random() * 2)] as Direction;
    } else {
      const orth = ["x", "y", "z"].filter(d => d !== this.prevDirection);
      direction = [this.prevDirection, ...orth][Math.floor(Math.random() * 4)] as Direction;
    }

    const end = start.clone();
    const delta = this.segmentLength;

    if (direction === this.prevDirection) {
      end[direction] += delta; // forward only
    } else {
      end[direction] += Math.random() < 0.5 ? delta : -delta;
    }

    // Detect repeated vertices
    const endKey = this.pointKey(end);
    if (this.visitedPoints.has(endKey) && !(end.x === 0 && end.y === 0 && end.z === 0)) {
      // Self-intersecting → abort configuration
      this.resetRun();
      return;
    }

    // Detect repeated edges
    const e1 = this.edgeKey(start, end);
    const e2 = this.edgeKey(end, start);
    if (this.visitedEdges.has(e1) || this.visitedEdges.has(e2)) {
      // Edge reuse → not simple
      this.resetRun();
      return;
    }

    // Store visited
    this.visitedPoints.add(this.pointKey(start));
    this.visitedPoints.add(this.pointKey(end));
    this.visitedEdges.add(e1);

    // Render segment
    const line = this.makeLine(start, end, this.color);
    this.currentSegments.push(line);
    this.add(line);

    this.prevSegmentEnd = end.clone();
    this.prevDirection = direction;
  }

  private hasSelfIntersection(): boolean {
    const pts = Array.from(this.visitedPoints);
    // return false;

    // A simple cycle has:
    // - each vertex visited <= 2 times (start/end exception)
    const counts = new Map<string, number>();
    for (const p of pts) {
      counts.set(p, (counts.get(p) ?? 0) + 1);
      if (counts.get(p)! > 2) return true;
    }

    return false;
  }
}

