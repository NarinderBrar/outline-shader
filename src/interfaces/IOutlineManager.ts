import { AbstractMesh } from "@babylonjs/core";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export interface IOutlineManager {
  setSelected(selected: AbstractMesh | null);
  setColor(color: Color3): void;
  setWidth(width: number): void;
}
