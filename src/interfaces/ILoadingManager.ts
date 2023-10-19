import { Observable } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export interface ILoadingManager {
  onMeshesLoadedObservable: Observable<Mesh[]>;
  loadFile(file: string): void;
}
