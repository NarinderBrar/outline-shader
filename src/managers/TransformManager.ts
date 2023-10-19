import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { UtilityLayerRenderer } from "@babylonjs/core/";
import { GizmoManager } from "@babylonjs/core/Gizmos/gizmoManager";
import { ITransformManager } from "../interfaces/ITransformManager";

export class TransformManager implements ITransformManager {
  private _utilLayer: UtilityLayerRenderer;
  private _gizmoManager: GizmoManager;
  private _meshes: Mesh[] = [];

  constructor(scene: Scene) {
    this._utilLayer = new UtilityLayerRenderer(scene);
    this._gizmoManager = new GizmoManager(scene, 3, this._utilLayer);
    this._gizmoManager.rotationGizmoEnabled = true;
    this._gizmoManager.gizmos.rotationGizmo.scaleRatio = 0.5;
  }

  public attachMesh = (mesh: Mesh): void => {
    this._gizmoManager.rotationGizmoEnabled = true;
    this._meshes.push(mesh);
    this._gizmoManager.attachableMeshes = this._meshes;
    this._gizmoManager.attachToMesh(mesh);
  };

  public hideGizmo = (): void => {
    this._gizmoManager.rotationGizmoEnabled = false;
  };

  public rotationSnap = (angleStep: number): void => {
    const distance = angleStep * (Math.PI / 180);
    this._gizmoManager.gizmos.rotationGizmo.snapDistance = distance;
  };
}
