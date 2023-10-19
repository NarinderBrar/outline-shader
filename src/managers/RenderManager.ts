import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { IRenderManager } from "../interfaces/IRenderManager";

export class RenderManager implements IRenderManager {
  private _engine: Engine;
  private _scene: Scene;
  private _enable: boolean = false;

  constructor(scene: Scene) {
    this._scene = scene;
    this._engine = scene.getEngine();

    this._engine.runRenderLoop(() => {
      if (!this._enable) return;

      this._scene.render();
    });
  }

  public startRender = () => {
    this._enable = true;
  };
  public stopRender = () => {
    this._enable = false;
  };
}
