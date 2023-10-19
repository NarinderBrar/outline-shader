import { Control } from "@babylonjs/gui/2D/controls/control";
import { Grid } from "@babylonjs/gui/2D/controls/grid";
import { RadioButton } from "@babylonjs/gui/2D/controls/radioButton";
import {
  Button,
  Checkbox,
  ColorPicker,
  InputText,
  Slider,
  TextBlock,
} from "@babylonjs/gui/2D/controls";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { nEngine } from "../nEngine";
import { Asset } from "../data/DataLoader";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export class UIController {
  adt: AdvancedDynamicTexture;
  private _scene: Scene;
  private nengine: nEngine;

  private _assets: Asset[] = [];
  private _hoverBtn: boolean = false;

  constructor(nengine: nEngine) {
    this.nengine = nengine;
    this._scene = nengine.getScene();

    this.adt = AdvancedDynamicTexture.CreateFullscreenUI(
      "adtUI",
      true,
      this._scene
    );

    const spanel = new StackPanel();
    spanel.width = "200px";
    spanel.height = 1;
    spanel.top = "30px";
    spanel.left = "-30px";
    spanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    spanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.adt.addControl(spanel);

    const text1 = new TextBlock();
    text1.text = "POSITION SNAP STEP";
    text1.color = "white";
    text1.fontSize = 15;
    text1.width = "230px";
    text1.height = "50px";
    text1.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    text1.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    spanel.addControl(text1);

    const input = new InputText();
    input.width = "50px";
    input.height = "30px";
    input.text = "0";
    input.color = "white";
    input.background = "gray";
    input.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    input.onTextChangedObservable.add((newValue) => {
      let step: number = +newValue.text;
      if (step <= 0) step = 0;
      nengine.getSnapManager().setSnapStep(step);
    });
    spanel.addControl(input);

    const text4 = new TextBlock();
    text4.text = "ROTATION SNAP STEP";
    text4.color = "white";
    text4.fontSize = 15;
    text4.width = "230px";
    text4.height = "50px";
    text4.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    spanel.addControl(text4);

    const input2 = new InputText();
    input2.width = "50px";
    input2.height = "30px";
    input2.text = "0";
    input2.color = "white";
    input2.background = "gray";
    input2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    input2.onTextChangedObservable.add((newValue) => {
      let step: number = +newValue.text;
      if (step <= 0) step = 0;
      nengine.getTransfomrManager().rotationSnap(step);
    });
    spanel.addControl(input2);

    const text2 = new TextBlock();
    text2.text = "AVOID OVERLAP";
    text2.color = "white";
    text2.fontSize = 15;
    text2.width = "230px";
    text2.height = "50px";
    text2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    spanel.addControl(text2);

    const checkbox = new Checkbox();
    checkbox.width = "20px";
    checkbox.height = "20px";
    checkbox.isChecked = false;
    checkbox.color = "white";
    checkbox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    checkbox.onIsCheckedChangedObservable.add((value) => {
      nengine.getSnapManager().setAvoid(value);
    });
    spanel.addControl(checkbox);

    const text5 = new TextBlock();
    text5.text = "OUTLINE WIDTH";
    text5.color = "white";
    text5.fontSize = 15;
    text5.width = "230px";
    text5.height = "50px";
    text5.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    spanel.addControl(text5);

    const slider = new Slider();
    slider.minimum = 1;
    slider.maximum = 10;
    slider.value = 1;
    slider.height = "20px";
    slider.width = "200px";
    slider.color = "white";
    slider.background = "white";
    slider.onValueChangedObservable.add(function (value) {
      nengine.getOutlineManager().setWidth(value);
    });
    spanel.addControl(slider);

    const text3 = new TextBlock();
    text3.text = "OUTLINE COLOR";
    text3.color = "white";
    text3.fontSize = 15;
    text3.width = "230px";
    text3.height = "50px";
    text3.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    spanel.addControl(text3);

    const picker = new ColorPicker();
    picker.value = new Color3(0, 0, 0);
    picker.height = "150px";
    picker.width = "150px";
    picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    picker.onValueChangedObservable.add(function (value) {
      nengine.getOutlineManager().setColor(value);
    });
    spanel.addControl(picker);
  }

  private _getAssetByID = (id: string): Asset | undefined => {
    for (const model of this._assets) {
      if (model.id === id) {
        return model;
      }
    }
    return undefined;
  };

  public createPanels = (assets: Asset[]) => {
    this._assets = assets;

    const buildingModels: Asset[] = [];
    const natureModels: Asset[] = [];
    const propModels: Asset[] = [];

    assets.forEach((model) => {
      if (model.type === "building") {
        buildingModels.push(model);
      } else if (model.type === "natures") {
        natureModels.push(model);
      } else if (model.type === "props") {
        propModels.push(model);
      }
    });

    const buildingSP = this._addRadio("BUILDINGS", "10px", "5px");
    this.adt.addControl(buildingSP);
    const naturesSP = this._addRadio("NATURES", "40px", "5px");
    this.adt.addControl(naturesSP);
    const propsSP = this._addRadio("PROPS", "70px", "5px");
    this.adt.addControl(propsSP);

    const buildingRBtn = buildingSP.getChildByName("buildings") as RadioButton;
    buildingRBtn.isChecked = true;
    const naturesRBtn = naturesSP.getChildByName("natures") as RadioButton;
    const propsRBtn = propsSP.getChildByName("props") as RadioButton;

    const buildingPanel = this._createPanel("box", buildingModels);
    buildingPanel.isVisible = true;
    buildingPanel.width = "500px";
    buildingPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.adt.addControl(buildingPanel);

    const naturesPanel = this._createPanel("naturesPanel", natureModels);
    naturesPanel.isVisible = false;
    naturesPanel.width = "500px";
    naturesPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.adt.addControl(naturesPanel);

    const propsPanel = this._createPanel("propsPanel", propModels);
    propsPanel.isVisible = false;
    propsPanel.width = "500px";
    propsPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.adt.addControl(propsPanel);

    buildingRBtn.onIsCheckedChangedObservable.add(function (state) {
      if (state) {
        buildingPanel.isVisible = true;
        naturesPanel.isVisible = false;
        propsPanel.isVisible = false;
      }
    });

    naturesRBtn.onIsCheckedChangedObservable.add(function (state) {
      if (state) {
        buildingPanel.isVisible = false;
        naturesPanel.isVisible = true;
        propsPanel.isVisible = false;
      }
    });

    propsRBtn.onIsCheckedChangedObservable.add(function (state) {
      if (state) {
        buildingPanel.isVisible = false;
        naturesPanel.isVisible = false;
        propsPanel.isVisible = true;
      }
    });
  };

  private _addRadio = (text: string, top: string, left: string): StackPanel => {
    const radioButton = new RadioButton();
    radioButton.name = text.toLowerCase();
    radioButton.width = "20px";
    radioButton.height = "20px";
    radioButton.color = "white";
    radioButton.background = "gray";

    const header: StackPanel = Control.AddHeader(radioButton, text, "100px", {
      isHorizontal: true,
      controlFirst: true,
    });

    header.color = "white";
    header.height = "30px";
    header.left = left;
    header.top = top;
    header.fontSize = 12;

    header.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    header.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    return header;
  };

  private _createPanel = (name: string, assets: Asset[]) => {
    const assetsLength = assets.length;
    const gridSizeX = Math.floor(assetsLength / 2);
    const gridSizeY = 2;
    const panelPaddingTop = 120;
    const panelPaddingLeft = 5;
    const columnPadding = 5;
    const columnWidth = 100;
    const btnWidth = 100;
    const btnHeight = 100;

    const panel = new Grid(name);
    panel.top = panelPaddingTop + "px";
    panel.left = panelPaddingLeft + "px";
    panel.width = "100%";
    panel.height = "100%";

    for (let i = 0; i < gridSizeX; i++) {
      panel.addColumnDefinition(columnWidth, true);
      panel.addColumnDefinition(columnPadding, true);
      for (let j = 0; j < gridSizeY; j++) {
        panel.addRowDefinition(columnWidth, true);
        panel.addRowDefinition(columnPadding, true);
      }
    }

    this.adt.addControl(panel);

    let k = 0;

    for (let i = 0; i < gridSizeX; i++) {
      for (let j = 0; j < gridSizeY; j++) {
        const asset = assets[k];
        const button = this._createImageButton(asset, {
          width: btnWidth,
          height: btnHeight,
        });
        panel.addControl(button, i * 2, j * 2);
        k++;
      }
    }
    return panel;
  };

  private _createImageButton = (asset: Asset, { width, height }): Button => {
    const button = Button.CreateImageOnlyButton(
      "button_" + asset.id,
      asset.image
    );

    button.width = width + "px";
    button.height = height + "px";
    button.thickness = 2;

    button.onPointerDownObservable.add(() => {
      this._hoverBtn = true;
      const idRegex = /(\d+)/;
      const match = button.name.match(idRegex);

      if (match[1]) {
        this._importModelInScene(match[1]);
      }
    });

    button.onPointerUpObservable.add(() => {
      this._onPointerUp();
    });

    button.onPointerOutObservable.add(() => {
      this._hoverBtn = false;
    });

    button.onPointerEnterObservable.add(() => {
      this._hoverBtn = true;
    });

    return button;
  };

  private _importModelInScene = (id: string) => {
    const asset = this._getAssetByID(id);
    if (!asset) {
      console.error("Could not find asset");
    }

    this.nengine.addModel(asset);
  };

  private _onPointerUp = () => {
    this._hoverBtn ? this.nengine.removeActiveMesh() : this.nengine.stopSnap();
  };
}
