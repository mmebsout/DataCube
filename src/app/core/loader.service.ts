import { Injectable } from '@angular/core';

@Injectable()
export class LoaderService {

  isDataCube: boolean;
  isSpectre: boolean;
  isHistogramme: boolean;
  isDesc: boolean;

  constructor() {}

  
  init(datacube: boolean, spectre: boolean, histogramme: boolean, description: boolean) {
    this.isDataCube = datacube;
    this.isSpectre = spectre;
    this.isHistogramme = histogramme;
    this.isDesc = description;
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

}
