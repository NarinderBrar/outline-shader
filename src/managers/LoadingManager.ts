import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Observable } from "@babylonjs/core";
import "@babylonjs/loaders";
import { ILoadingManager } from "../interfaces/ILoadingManager";

export class LoadingManager implements ILoadingManager {
  private _scene: Scene;
  public onMeshesLoadedObservable = new Observable<Mesh[]>();

  constructor(scene: Scene) {
    this._scene = scene;
  }

  private _onSuccessLoading = (meshes) => {
    this.onMeshesLoadedObservable.notifyObservers(meshes);
  };

  public loadFile = (file: string) => {
    SceneLoader.ImportMesh(
      "",
      file,
      "",
      this._scene,
      this._onSuccessLoading,
      null
    );
  };
}
