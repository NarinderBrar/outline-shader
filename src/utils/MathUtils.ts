import { BoundingBox } from "@babylonjs/core/";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Quaternion } from "@babylonjs/core/Maths/math.vector";
import { Matrix } from "@babylonjs/core/Maths/math.vector";

export class MathUtils {
  public static getBBoxLowerPoint(bb: BoundingBox): Vector3 {
    const cx =
      (bb.vectors[0].x + bb.vectors[2].x + bb.vectors[4].x + bb.vectors[7].x) /
      4;
    const cy =
      (bb.vectors[0].y + bb.vectors[2].y + bb.vectors[4].y + bb.vectors[7].y) /
      4;
    const cz =
      (bb.vectors[0].z + bb.vectors[2].z + bb.vectors[4].z + bb.vectors[7].z) /
      4;

    return new Vector3(cx, cy, cz);
  }
  public static rotateAlign(v1: Vector3, v2: Vector3): Quaternion {
    const axis = Vector3.Cross(v1, v2);
    const cosA = Vector3.Dot(v1, v2);
    const k = 1.0 / (1.0 + cosA);

    const matrix: Matrix = new Matrix();
    matrix.addAtIndex(0, axis.x * axis.x * k + cosA);
    matrix.addAtIndex(1, axis.x * axis.y * k + axis.z);
    matrix.addAtIndex(2, axis.x * axis.z * k - axis.y);
    matrix.addAtIndex(4, axis.y * axis.x * k - axis.z);
    matrix.addAtIndex(5, axis.y * axis.y * k + cosA);
    matrix.addAtIndex(6, axis.y * axis.z * k + axis.x);
    matrix.addAtIndex(8, axis.z * axis.x * k + axis.y);
    matrix.addAtIndex(9, axis.z * axis.y * k - axis.x);
    matrix.addAtIndex(10, axis.z * axis.z * k + cosA);
    matrix.addAtIndex(15, 1);

    const tPos = Vector3.Zero();
    const tRotQ = new Quaternion();
    const tScl = Vector3.Zero();

    matrix.decompose(tScl, tRotQ, tPos);

    return tRotQ;
  }
}
