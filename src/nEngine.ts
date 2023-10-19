import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { SnapManager } from "./managers/SnapManager";
import { LoadingManager } from "./managers/LoadingManager";
import { GridMaterial } from "@babylonjs/materials";
import { RenderManager } from "./managers/RenderManager";
import { Asset } from "./data/DataLoader";
import { TransformManager } from "./managers/TransformManager";
import { PBRMaterial, Texture } from "@babylonjs/core";
import { OutlineManager } from "./managers/OutlineManager";
import { PickingManager } from "./managers/PickingManager";
import { IOutlineManager } from "./interfaces/IOutlineManager";
import { IPickingManager } from "./interfaces/IPickingManager";
import { IRenderManager } from "./interfaces/IRenderManager";
import { ILoadingManager } from "./interfaces/ILoadingManager";
import { ISnapManager } from "./interfaces/ISnapManager";
import { ITransformManager } from "./interfaces/ITransformManager";

export class nEngine {
  private _scene: Scene;

  //managers
  private _renderManager: IRenderManager;
  private _snapManager: ISnapManager;
  private _loadingManager: ILoadingManager;
  private _transformManager: ITransformManager;
  private _pickingManager: IPickingManager;
  private _outlineManager: IOutlineManager;

  private _activeRootMesh: Mesh | null = null;
  private _addedMeshes: Mesh[] = [];

  constructor() {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "nCanvas";
    document.body.appendChild(canvas);

    const engine = new Engine(canvas, true);
    this._scene = new Scene(engine);

    const camera = this._setupCamera();
    camera.attachControl(canvas, true);

    this._setupLights();

    this._createGround();

    this._addPrimitive();

    this._snapManager = new SnapManager(this._scene);
    this._loadingManager = new LoadingManager(this._scene);
    this._transformManager = new TransformManager(this._scene);

    this._renderManager = new RenderManager(this._scene);
    this._renderManager.startRender();

    this._pickingManager = new PickingManager(this._scene);
    this._outlineManager = new OutlineManager(this._scene);

    this._loadingManager.onMeshesLoadedObservable.add((meshes) =>
      this._onMeshAdded(meshes)
    );

    this._scene.onBeforeRenderObservable.add(this._onBeforeRender);

    window.addEventListener("resize", function () {
      engine.resize();
    });
  }

  private _createGround = () => {
    const groundMaterial = new GridMaterial("groundMaterial", this._scene);
    groundMaterial.majorUnitFrequency = 5;
    groundMaterial.minorUnitVisibility = 0.45;
    groundMaterial.gridRatio = 0.3;

    groundMaterial.backFaceCulling = false;
    groundMaterial.mainColor = new Color3(1, 1, 1);
    groundMaterial.lineColor = new Color3(1.0, 1.0, 1.0);
    groundMaterial.opacity = 0.2;

    const ground: Mesh = MeshBuilder.CreateGround(
      "ground",
      { width: 100, height: 100 },
      this._scene
    );
    ground.isPickable = false;
    ground.material = groundMaterial;
  };

  private _addPrimitive = () => {
    const box = MeshBuilder.CreateBox("box", { size: 10 }, this._scene);
    box.position.set(5, 0, 0);
    const sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 10 },
      this._scene
    );
  };

  private _setupLights = () => {
    const light: HemisphericLight = new HemisphericLight(
      "light",
      new Vector3(1, 1, 0),
      this._scene
    );
  };

  private _setupCamera = (): Camera => {
    const camera: ArcRotateCamera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      10,
      Vector3.Zero(),
      this._scene
    );

    camera.setPosition(new Vector3(0, 30, 80));
    return camera;
  };

  private _onBeforeRender = (): void => {
    if (!this._outlineManager) return;

    const mesh = this._pickingManager.pick();
    this._outlineManager.setSelected(mesh);
  };

  public getScene = (): Scene => {
    return this._scene;
  };

  public getLoadingManager = (): ILoadingManager => {
    return this._loadingManager;
  };

  public getSnapManager = (): ISnapManager => {
    return this._snapManager;
  };

  public getTransfomrManager = (): ITransformManager => {
    return this._transformManager;
  };

  public getOutlineManager = (): IOutlineManager => {
    return this._outlineManager;
  };

  public addModel = (asset: Asset) => {
    this._loadingManager.loadFile(asset.model);
    this._transformManager.hideGizmo();
  };

  private _onMeshAdded = (meshes: Mesh[]) => {
    this._addedMeshes = meshes;

    // const textureOriginalUrl =
    //   "http://localhost:8080/localAssets/models/Building_Bar.png";

    // const texture = new Texture(
    //   textureOriginalUrl,
    //   this.getScene(),
    //   true,
    //   false,
    //   Texture.BILINEAR_SAMPLINGMODE,
    //   () => console.log("Successful texture Loaded!"),
    //   (error) => console.error("error!", error)
    // );

    this._addedMeshes.forEach((mesh) => {
      mesh.isPickable = false;

      const mat = mesh.material;
      // console.log(mat);

      if (mat instanceof PBRMaterial) {
        mat.emissiveIntensity = 0;
        mat.emissiveColor = new Color3(0, 0, 0);
        // texture.onLoadObservable.add(() => {
        //   mat.albedoTexture = texture;
        //   mat.emissiveTexture = texture;

        // });
      }
    });

    const root = this._addedMeshes[0];

    //take only root mesh
    this._activeRootMesh = root;
    this._snapManager.startSnap(this._activeRootMesh);
  };

  public stopSnap = () => {
    this._snapManager.stopSnap();
    this._addedMeshes.forEach((mesh) => (mesh.isPickable = true));
    this._transformManager.attachMesh(this._activeRootMesh);
  };

  public removeActiveMesh = () => {
    this._activeRootMesh.dispose();
  };
}
