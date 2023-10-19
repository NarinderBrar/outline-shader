import { nEngine } from "./nEngine";
import { UIController } from "./frontend/UIController";
import { DataLoader } from "./data/DataLoader";

class App {
  constructor() {
    // initialize Engine
    const nengine = new nEngine();

    // initialize frontend
    const uiController = new UIController(nengine);

    // load data
    const dataLoader = new DataLoader();
    const jsonURL = "/assets.json";
    dataLoader
      .loadJSON(jsonURL)
      .then(() => {
        //create frontend panels from data
        uiController.createPanels(dataLoader.getAllAssets());
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}
new App();
