import * as THREE from "three";

export class AxisGrid extends THREE.Group {
  constructor(size = 10, step = 1, color = 0x444444) {
    super();

    const material = new THREE.LineBasicMaterial({ color });

    // XZ Plane (ground)
    const gridXZ = new THREE.LineSegments(
      new THREE.GridHelper(size, size / step).geometry,
      material
    );

    // XY Plane
    const gridXY = new THREE.LineSegments(
      new THREE.GridHelper(size, size / step).geometry,
      material
    );
    gridXY.rotation.x = Math.PI / 2;

    // YZ Plane
    const gridYZ = new THREE.LineSegments(
      new THREE.GridHelper(size, size / step).geometry,
      material
    );
    gridYZ.rotation.z = Math.PI / 2;


    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    )

    center.position.x = 0;
    center.position.y = 0;
    center.position.z = 0;

    this.add(gridXZ,  center);
  }
}

