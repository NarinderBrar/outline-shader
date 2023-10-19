import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
export interface IPickingManager {
  pick(): AbstractMesh;
}
