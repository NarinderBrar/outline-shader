import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MathUtils } from "../utils/MathUtils";
import { Scene } from "@babylonjs/core/scene";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ISnapManager } from "../interfaces/ISnapManager";
import { BoundingInfo } from "@babylonjs/core";

export enum DROP_TYPE {
  GRID = "GRID",
  MESH = "MESH",
}

export class SnapManager implements ISnapManager {
  private _scene: Scene;
  private _activeMesh: Mesh | null = null;
  private _enable: boolean = false;
  private _snaptype = DROP_TYPE.GRID;
  private _hitMesh: Mesh | null = null;
  private _snapStep: number = 0;
  private _avoid: boolean = false;

  constructor(scene: Scene) {
    this._scene = scene;
    this._scene.onBeforeRenderObservable.add(this._updateSnap.bind(this));
  }

  private _snapToNearestUnits = (
    x: number,
    y: number,
    z: number,
    units: number
  ): Vector3 => {
    if (units == 0) return new Vector3(x, y, z);
    const snappedX = Math.round(x / units) * units;
    const snappedY = Math.round(y / units) * units;
    const snappedZ = Math.round(z / units) * units;
    return new Vector3(snappedX, snappedY, snappedZ);
  };

  private _snap = (type: DROP_TYPE, tn: TransformNode, pointer: Vector2) => {
    const scene = tn.getScene();
    const pickingInfo = scene.pick(pointer.x, pointer.y);
    if (!pickingInfo) return;

    if (type == DROP_TYPE.GRID) {
      const ray = pickingInfo.ray;
      if (!ray) return;

      const ro = ray.origin;
      let rd = pickingInfo?.ray?.direction.scale(-1);

      if (!ro || !rd) {
        return false;
      }

      const yOffset = 0;
      const epsilon = 0.1;
      const p = Vector3.UpReadOnly;

      rd = rd.scale(10000);

      const px = ro.x + rd.x;
      const py = ro.y + rd.y;
      const pz = ro.z + rd.z;

      const tDenom = p.x * (px - ro.x) + p.y * (py - ro.y) + p.z * (pz - ro.z);
      if (tDenom < epsilon) return false;

      const t = -(p.x * ro.x + p.y * ro.y + p.z * ro.z + yOffset) / tDenom;

      const pos = this._snapToNearestUnits(
        ro.x + t * (px - ro.x),
        ro.y + t * (py - ro.y),
        ro.z + t * (pz - ro.z),
        this._snapStep
      );
      const prePos = tn.position.clone();
      tn.position.copyFrom(pos);

      if (this._avoid) {
        if (tn instanceof Mesh) {
          const minmMax = tn.getHierarchyBoundingVectors(true);
          const boundingInfo = new BoundingInfo(minmMax.min, minmMax.max);

          for (let i = 0; i < scene.rootNodes.length; i++) {
            const other = scene.rootNodes[i];
            if (other.name == "ground" || other == tn) continue;
            const minmMaxOther = other.getHierarchyBoundingVectors(true);
            const boundingInfoOther = new BoundingInfo(
              minmMaxOther.min,
              minmMaxOther.max
            );
            const intersetc = boundingInfo.intersects(boundingInfoOther, true);
            if (intersetc) {
              tn.position.copyFrom(prePos);
              break;
            }
          }
        }
      }
    } else if (type == DROP_TYPE.MESH) {
      this._hitMesh = pickingInfo?.pickedMesh as Mesh;

      if (this._hitMesh) {
        //hit info
        const hitPosition = pickingInfo.pickedPoint ?? Vector3.Zero();
        const hitNormal = pickingInfo.getNormal(true);

        //object info
        let position: Vector3;
        if (tn instanceof Mesh) {
          const bbInfo = tn.getBoundingInfo();
          const bb = bbInfo.boundingBox;
          const bbCenter: Vector3 = bb.center;

          //position calculation
          const bottomPoint = MathUtils.getBBoxLowerPoint(bb);
          const bottomOffset = Vector3.Distance(bottomPoint, bbCenter);
          position = hitPosition.add(tn.up.scale(bottomOffset * tn.scaling.y));
        } else {
          position = hitPosition;
        }
        if (hitNormal) {
          tn.rotationQuaternion = MathUtils.rotateAlign(
            Vector3.UpReadOnly,
            hitNormal
          );
        }
        tn.setAbsolutePosition(position);
      } else {
        return false;
      }
    }
  };

  public setSnapStep(step: number) {
    this._snapStep = step;
  }

  public setAvoid(avoid: boolean) {
    this._avoid = avoid;
  }

  private _updateSnap = () => {
    if (!this._enable || !this._activeMesh) return;

    const pointer = new Vector2(this._scene.pointerX, this._scene.pointerY);

    if (this._snaptype === DROP_TYPE.MESH) {
      const isMeshSnap = this._snap(this._snaptype, this._activeMesh, pointer);
      //if there is no mesh for snap, start snaping with ground
      if (!isMeshSnap) {
        this._activeMesh.rotationQuaternion = Quaternion.Identity();
        this._snap(DROP_TYPE.GRID, this._activeMesh, pointer);
      }
    }
    this._snap(this._snaptype, this._activeMesh, pointer);
  };

  public startSnap = (mesh: Mesh) => {
    this._enable = true;
    this._activeMesh = mesh;
    this._activeMesh.isPickable = false;

    this._snaptype = DROP_TYPE.GRID;

    //TODO: this approach need to be improved, we can't rely on the name

    const firstChild = mesh.getChildren()[0];
    if (firstChild) {
      const name = firstChild.name;
      if (name.startsWith("Props")) this._snaptype = DROP_TYPE.MESH;
    }
  };

  public stopSnap = () => {
    this._enable = false;

    if (this._snaptype != DROP_TYPE.MESH) return;
    if (this._hitMesh) this._activeMesh.setParent(this._hitMesh, false);

    this._activeMesh = null;
  };
}
