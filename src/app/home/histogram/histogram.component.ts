import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { SlideService } from '../dataCube/slide.service';
import { LoaderService } from '../../core/loader.service';
import { Fit } from '../../shared/classes/fit';
import { CustomHTMLElement } from '../../shared/classes/custom-html';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { CubeToHistoService } from '../../shared/services/cube-to-histo.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare function require(moduleName: string): any;
const Plotly = require('plotly.js/lib/index-cartesian.js');
const _ = require('lodash');

@Component({
	selector: 'app-histogram',
	templateUrl: './histogram.component.html',
	styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit {
	@Output()
	histoLoadingStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Output()
	newImageEmitter: EventEmitter<any> = new EventEmitter<any>();

	@Output()
	newHmaxEmitter: EventEmitter<any> = new EventEmitter<any>();

	@Output()
	newResetEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

	mustBeLoaded: boolean;
	slideData: any = [];
	currentSlide: any = new Fit(null);
	activeLinear = <boolean>true;
	activeExpo = <boolean>false;
	activeSqr = <boolean>false;
	activeAsin = <boolean>false;
	image: any = [];
	hmax = <number>0;
	isLoadingHisto = <boolean>true;
	filterBy: any;
	histogram: any = [];
	traceAdded = <boolean>false;
	histo_transfer: any = [];
	// pathData: string = null;
	tmin = <number>0;
	tmax = <number>0;
	//TODO change number of bins
	nbBins = <number>255;
	colorscale = <string>"";
	tranche = <number>1;


	/**
	 * Constructor of histogram component
	 * @constructor
	 * @param {I18nService} i18nService - Translate service provider
	 * @param {SlideService} slideService
	 * @param {StreamFitService} streamFitService - Fit file getter service provider
	 */
	constructor(
		private i18nService: I18nService,
		private slideService: SlideService,
		private cubeToHistoService: CubeToHistoService,
		private loaderService: LoaderService,
		private streamFitService: StreamFitService, public toastr: ToastsManager) {
		this.mustBeLoaded = this.loaderService.histogram;

		this.cubeToHistoService.Colorscale$.subscribe(color => {
			this.setColor(color);
		});

		this.cubeToHistoService.tranche$.subscribe(tranche => {
			this.setTranche(tranche);
			this.ngOnInit();
		});


		if (this.loaderService.fileData != null) {
			this.currentSlide = new Fit(this.loaderService.fileData);
		}

		//if data file is loaded
		streamFitService.FitFile$.subscribe(fit => {
			// if(this.loaderService.dataPath != null && this.loaderService.dataPath != undefined){
			// 	this.pathData = this.loaderService.dataPath;
			// }
			this.currentSlide = new Fit(fit);
			this.ngOnInit();
		});
	}

	setColor(color: string) {
		this.colorscale = color;
	}

	setTranche(tranche: number) {
		this.tranche = tranche;
	}

	swap(json: any) {
		let ret = [];
		for (let key in json) {
			ret[json[key]] = key;
		}
		return ret;
	}

	getHMAX(val: any, hist_tmp: any) {
		this.hmax = Number.MIN_VALUE;
		for (let i = 0; i < val.length; i++) {
			const bin = (val[i] == null) ? 0 : val[i].toPrecision(1);
			hist_tmp[bin] = 0;

		}
		for (let i = 0; i < val.length; i++) {
			let bin = (val[i] == null) ? 0 : val[i].toPrecision(1);
			hist_tmp[Number(bin)]++;
			if (hist_tmp[Number(bin)] > this.hmax) {
				this.hmax = hist_tmp[Number(bin)];
			}
		}
	}

	/**
	 * Histogram Init Function
	 */
	ngOnInit() {
		this.slideService
			.getNextTranche({ id: this.currentSlide.name }, { idTranche: this.tranche })
			.finally(() => {
				this.histoLoadingStatus.emit(false);
			})
			.subscribe(slideData => {
				//get user role
				let role: any = null;
				role = JSON.parse(localStorage.getItem('userNameRole'));

				//get list files authorized
				let list: any = localStorage.getItem('listfilesPublic').split(",");

				//check if user is authorized
				if ((localStorage.getItem('userNameDataCube') == "admin")
					|| ((localStorage.getItem('userNameDataCube') !== "admin") && (role == "public" && list.indexOf(this.currentSlide.name) !== -1))
				) {
					this.slideData = slideData;
					if (this.slideData.feature instanceof Object) {
						this.image = this.slideData.feature.properties.slide.value;

						let val = <any>[];
						let result_final = <any>[];
						const colorLength = 256;
						this.image.map((xi: any, i: number) => {
							xi.map((ji: any, j: number) => {
								val.push(ji);
							});
						});
						let hist_tmp = new Array(colorLength);
						let max = 0, min = 0;
						this.image.map((xi: any, i: number) => {
							max = Math.max.apply(null, xi);
							min = Math.min.apply(null, xi);

							if (max > this.tmax) {
								this.tmax = max;
							}

							if (min < this.tmin) {
								this.tmin = min;
							}
						});
						console.log(this.tmin + " " + this.tmax);

						this.getHMAX(val, hist_tmp);

						hist_tmp = this.swap(hist_tmp);
						this.histo_transfer = hist_tmp;
						if (this.mustBeLoaded) {
							this.setHistogram(val);
							const r = this.getRange();
						}
					}
				}
				else {
					this.toastr.error("Forbidden", 'Oops!');
				}
			});
	}


	/**
	 * Compute Values To DataCube After Threshold
	 * @function computeValuesToDataCubeAfterThreshold
	 * @param {any} range thresold
	 */
	computeValuesToDataCubeAfterThreshold(range: any) {
		let newImageAfterThreshold: any = [];
		if (range == undefined) {
			range = { min: this.tmin, max: this.tmax };
		}

		let tmp = 0;
		if (this.activeLinear) {
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					if (isNaN(ji) || ji == null) {
						tmp = NaN;
					} else if (ji < range.min) {
						tmp = range.min;
					} else if (ji > range.max) {
						tmp = range.max;
					} else {
						tmp = (ji - range.min) / (range.max - range.min) * range.max;
					}
					return tmp;
				})
			});
		}
		else if (this.activeExpo) {
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					if (isNaN(ji) || ji == null) {
						tmp = NaN;
					} else if (ji < range.min) {
						tmp = range.min;
					} else if (ji > range.max) {
						tmp = range.max;
					} else {
						tmp = Math.sqrt(ji - range.min) / Math.sqrt(range.max - range.min) * range.max;
					}
					return tmp;
				})
			});
		}
		else if (this.activeSqr) {
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					if (isNaN(ji) || ji == null) {
						tmp = NaN;
					} else if (ji < range.min) {
						tmp = range.min;
					} else if (ji > range.max) {
						tmp = range.max;
					} else {
						tmp = Math.exp(ji - range.min) / Math.exp(range.max - range.min) * range.max;
					}
					return tmp;
				})
			});
		}
		else if (this.activeAsin) {
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					if (isNaN(ji) || ji == null) {
						tmp = NaN;
					} else if (ji < range.min) {
						tmp = range.min;
					} else if (ji > range.max) {
						tmp = range.max;
					} else {
						tmp = Math.asin(ji - range.min) / Math.asin(range.max - range.min) * range.max;
					}
					return tmp;
				})
			});
		}

		this.newImageEmitter.emit(newImageAfterThreshold);
	}

	/**
	 * Histogram Setter Function
	 * @function setHistogram
	 * @param {any} x - X Axis array
	 */
	setHistogram(x: any) {

		this.histogram = x;

		//data to build histogramm
		const data = [
			{
				x: x,
				type: 'histogram',
				nbinsx: this.nbBins
			}
		];

		//layout config
		const layout = {
			yaxis: {
				fixedrange: true
			},
			xaxis: {
				rangeslider: {}
			},
			margin: {
				l: 40,
				r: 40,
				t: 40,
				b: 40
			}
		};

		Plotly.newPlot('histogram', data, layout, { responsive: true });
	}

	/**
	 * Get range histogramm and call threshold Datacube
	 * @function getRange
	 * @returns range min and range max
	 */
	getRange() {
		const myHisto = <CustomHTMLElement>document.getElementById('histogram');
		const range = {
			'min': <any>null,
			'max': <any>null
		};
		//if user change the range
		myHisto.on('plotly_relayout', (eventData: any) => {
			if (eventData["xaxis.range"] !== undefined) {
				range.min = eventData["xaxis.range"][0];
				range.max = eventData["xaxis.range"][1];
				if (range.min !== undefined) {
					this.computeValuesToDataCubeAfterThreshold(range);
				}
				return range;
			}
		});
	}

	/**
	 * Linear filter image function
	 * @function linear
	 */
	linear() {
		this.activeLinear = true;
		this.activeExpo = false;
		this.activeSqr = false;
		this.activeAsin = false;
		let newImageLinear: any = [];
		this.filterBy = 'linear';

		newImageLinear = this.image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				let value = 0;
				if (ji == null) {
					value = NaN;
				} else {
					value = ji;
				}
				return value;
			});
		});

		this.newImageEmitter.emit(newImageLinear);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
	}

	/**
	 * Expo filter image function
	 * @function expo
	 */
	expo() {
		this.activeExpo = true;
		this.activeLinear = false;
		this.activeSqr = false;
		this.activeAsin = false;
		let newImageExpo: any = [];
		this.filterBy = 'expo';

		newImageExpo = this.image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				let value = 0;
				if (ji == null) {
					value = NaN;
				} else {
					value = Math.sqrt(ji);
				}
				return value;
			});
		});

		this.newImageEmitter.emit(newImageExpo);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
	}

	/**
	 * Sqr filter image function
	 * @function sqr
	 */
	sqr() {
		this.activeSqr = true;
		this.activeExpo = false;
		this.activeLinear = false;
		this.activeAsin = false;
		let newImageSqr: any = [];
		this.filterBy = 'sqr';

		newImageSqr = this.image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				let value = 0;
				if (ji == null) {
					value = NaN;
				} else {
					value = Math.pow(ji, 2);
				}
				return value;
			});
		});

		this.newImageEmitter.emit(newImageSqr);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
	}

	/**
	 * Asin filter image function
	 * @function asin
	 */
	asin() {
		this.activeAsin = true;
		this.activeSqr = false;
		this.activeExpo = false;
		this.activeLinear = false;
		let newImageAsin: any = [];
		this.filterBy = 'asin';

		newImageAsin = this.image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				// Math.log(ji + Math.sqrt(Math.pow(ji, 2) + 1.0 )) /
				// 			Math.log(256 + Math.sqrt( Math.pow(256, 2) + 1.0 )) * this.hmax;
				let value = 0;
				if (ji == null) {
					value = NaN;
				} else {
					value = Math.asinh(ji);
				}
				return value;
			});
		});

		this.newImageEmitter.emit(newImageAsin);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
	}

	/**
	 * Reset histogram function and delete transfer function
	 * @function resetHisto
	 */
	resetHisto() {

		this.activeExpo = false;
		this.activeLinear = true;
		this.activeAsin = false;
		this.activeSqr = false;
		this.traceAdded = false;

		this.getRange();
		this.newImageEmitter.emit(this.slideData);
		this.newResetEmitter.emit(null);
		const graphDiv = <CustomHTMLElement>document.getElementById("histogram");

		//layout config
		const update = {
			yaxis: {
				fixedrange: true
			},
			xaxis: {
				rangeslider: {}
			},
			margin: {
				l: 40,
				r: 40,
				t: 40,
				b: 40
			}
		};
		Plotly.relayout(graphDiv, update);
	}

	setLanguage(language: string) {
		this.i18nService.language = language;
	}

	get currentLanguage(): string {
		return this.i18nService.language;
	}

	get languages(): string[] {
		return this.i18nService.supportedLanguages;
	}
}
