import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IPickingManager } from "../interfaces/IPickingManager";

export class PickingManager implements IPickingManager {
  private _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  public pick = (): AbstractMesh => {
    const pointer = new Vector2(this._scene.pointerX, this._scene.pointerY);

    const pickingInfo = this._scene.pick(pointer.x, pointer.y);
    if (!pickingInfo || !pickingInfo.pickedMesh) {
      return null;
    } else {
      return pickingInfo.pickedMesh;
    }
  };
}
