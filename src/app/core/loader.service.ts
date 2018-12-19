import { Injectable } from '@angular/core';

@Injectable()
export class LoaderService {

  isDataCube: boolean;
  isSpectre: boolean;
  isHistogramme: boolean;
  isDesc: boolean;
  dataPath : string;
  fileData : string;

  constructor() {}

  
  init(datacube: boolean, spectre: boolean, histogramme: boolean, description: boolean, path: string, file:string) {
    this.isDataCube = datacube;
    this.isSpectre = spectre;
    this.isHistogramme = histogramme;
    this.isDesc = description;
    this.dataPath = path;
    this.fileData = file;
  }

  /**
   * Gets datacube boolean.
   * @return {boolean} if datacube must be loaded.
   */
  get datacube(): boolean {
    return this.isDataCube;
  }

    /**
   * Gets spectre boolean.
   * @return {boolean} if spectre must be loaded.
   */
  get spectre(): boolean {
    return this.isSpectre;
  }

    /**
   * Gets histogramme string.
   * @return {boolean} if histogramme must be loaded.
   */
  get histogramme(): boolean {
    return this.isHistogramme;
  }

    /**
   * Gets description boolean.
   * @return {boolean} if description must be loaded.
   */
  get description(): boolean {
    return this.isDesc;
  }

   /**
   * Gets path string.
   * @return {string} if dataPath is defined.
   */
  get path(): string {
    return this.dataPath;
  }

   /**
   * Gets file string.
   * @return {string} if fileData is defined.
   */
  get file(): string {
    return this.fileData;
  }


}
