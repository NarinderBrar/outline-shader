import { Mesh } from "@babylonjs/core/Meshes/mesh";

export interface ITransformManager {
  attachMesh(mesh: Mesh): void;
  hideGizmo(): void;
  rotationSnap(angleStep: number): void;
}
