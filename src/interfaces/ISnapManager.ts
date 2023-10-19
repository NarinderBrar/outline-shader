import { Mesh } from "@babylonjs/core/Meshes/mesh";

export interface ISnapManager {
  startSnap(mesh: Mesh): void;
  stopSnap(): void;
  setAvoid(avoid: boolean): void;
  setSnapStep(step: number): void;
}
