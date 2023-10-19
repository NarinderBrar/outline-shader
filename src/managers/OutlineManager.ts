import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import { Scene } from "@babylonjs/core/scene";
import { IOutlineManager } from "../interfaces/IOutlineManager";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export class OutlineManager implements IOutlineManager {
  private _depthTexture: RenderTargetTexture;
  private _postProcess: PostProcess;
  private _color: Color3 = new Color3(0, 1, 0);
  private _width: number = 1.0;

  constructor(scene: Scene) {
    import("@babylonjs/core/Rendering/depthRendererSceneComponent").then(() => {
      const depthRender = scene.enableDepthRenderer();
      this._depthTexture = depthRender.getDepthMap();
      this._depthTexture.renderList = [];

      this._postProcess = new PostProcess(
        "outline shader",
        "./shader/outlineShader",
        null,
        ["depthTexture", "outlineColor", "outlineWidth", "resolution"],
        1.0,
        scene.activeCamera,
        Texture.NEAREST_SAMPLINGMODE,
        scene.getEngine()
      );

      this._postProcess.onApply = (effect) => {
        effect.setTexture("depthTexture", this._depthTexture);
        effect.setVector3(
          "outlineColor",
          new Vector3(this._color.r, this._color.g, this._color.b)
        );
        effect.setFloat("outlineWidth", this._width);
        effect.setVector2(
          "resolution",
          new Vector2(
            this._depthTexture.getRenderWidth(),
            this._depthTexture.getRenderHeight()
          )
        );
      };

      this._postProcess.onBeforeRender = (effect) => {
        effect.setVector3(
          "outlineColor",
          new Vector3(this._color.r, this._color.g, this._color.b)
        );
        effect.setFloat("outlineWidth", this._width);
      };

      this._postProcess.samples = 4;
    });
  }

  public setSelected = (selected: AbstractMesh | null) => {
    this._depthTexture.renderList = selected ? [selected] : [];
  };

  public setColor = (color: Color3) => {
    this._color.copyFrom(color);
  };

  public setWidth = (width: number) => {
    this._width = width;
  };
}
