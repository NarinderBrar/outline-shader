export type Asset = {
  id: string;
  type: string;
  name: string;
  image: string;
  model: string;
};

export class DataLoader {
  private _models: Asset[] = [];

  constructor() {}

  public loadJSON = async (jsonUrl: string): Promise<void> => {
    try {
      const response = await fetch(jsonUrl);
      const data = await response.json();
      this._models = data.models;
    } catch (error) {
      console.error(error);
    }
  };

  public getAllAssets = (): Asset[] => {
    return this._models;
  };
}
