import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { SlideService } from '../dataCube/slide.service';
import { LoaderService } from '../../core/loader.service';
import { Fit } from '../../shared/classes/fit';
import { CustomHTMLElement } from '../../shared/classes/custom-html';
import { StreamFitService } from '../../shared/services/stream-fit.service';

declare function require(moduleName: string): any;
const Plotly = require('plotly.js/lib/index-cartesian.js');

@Component({
	selector: 'app-histogramme',
	templateUrl: './histogramme.component.html',
	styleUrls: ['./histogramme.component.scss']
})
export class HistogrammeComponent implements OnInit {
	@Output()
	histoLoadingStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Output()
	newImageEmitter: EventEmitter<any> = new EventEmitter<any>();

	@Output()
	newHmaxEmitter: EventEmitter<any> = new EventEmitter<any>();

	@Output()
	newResetEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

	mustBeLoaded : boolean;
	slideData: any = [];
	currentSlide: any = new Fit(null);
	activeLinear = <boolean>false;
	activeExpo = <boolean>false;
	activeSqr = <boolean>false;
	activeAsin = <boolean>false;
	image: any = [];
	hmax = <number>0;
	isLoadingHisto = <boolean> true;
	filterBy: any;
	histogramme : any = [];
	traceAdded = <boolean>false;


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
		private loaderService: LoaderService,
		private streamFitService: StreamFitService) {
		this.mustBeLoaded = this.loaderService.histogramme;
		streamFitService.FitFile$.subscribe(fit => {
			this.currentSlide = new Fit(fit);
			this.ngOnInit();
		});
	}

	/**
	 * Histogram Init Function
	 */
	ngOnInit() {
		this.slideService
			.getSlide({id: this.currentSlide.name})
			.finally(() => {
				this.histoLoadingStatus.emit(false);
			})
			.subscribe(slideData => {
				this.slideData = slideData;
				if(this.slideData.feature instanceof Object) {
					this.image = this.slideData.feature.properties.slide.value;
					let max = 0, tmax = 0, min = 0, tmin = 0;
					let val = <any>[];
					const colorLength = 256;
					this.image.map((xi: any, i: number) => {
						max = Math.max.apply(null, xi);
						min = Math.min.apply(null, xi);
						if (max > tmax) {
							tmax = max;
						}
	
						if (min < tmin) {
							tmin = min;
						}
	
						xi.map((ji: any, j: number) => {
							val.push(ji);
						});
					});
	
					let hist = new Array(colorLength);
	
					for (let i = 0; i < colorLength; i++) {
						hist[i] = 0;
					}
	
					let hmax = Number.MIN_VALUE;
					
					for (let i = 0; i < val.length; i++) {
						const bin = Math.floor(colorLength * (val[i] - tmin) / (tmax - tmin));
						hist[bin]++;
	
						// Compute histogram max value
						if (hist[bin] > this.hmax) {
							this.hmax = hist[bin];
						}
					}
				
					if(this.mustBeLoaded){
						this.setHistogram(hist);
						const r = this.getRange();
					}	
				}
			
			});
	}

	/**
	 * Delete transfer function
	 * @function deleteTransferFunction
	 */
	deleteTransferFunction() {
		if(this.activeAsin || this.activeExpo || this.activeLinear || this.activeSqr) {
			Plotly.deleteTraces('histogramme', 1).then(() => {});
		}		
	}

	/**
	 * Draw transfer function
	 * @function drawTransferFunction
	 */
	drawTransferFunction() {
		if (this.traceAdded) {
			this.deleteTransferFunction();
		}
		let spline : any = [];
		let tmp_value = 0;
		let nbBins = this.histogramme.length;
		for (let i = 0; i < this.histogramme.length; i++) {
			let value = this.histogramme[i];
			if(this.activeLinear){
				tmp_value = (value / nbBins) * 255;
			}
			else if(this.activeExpo){
				tmp_value =
                        (Math.log(value / 10.0 + 1) /
                            Math.log(nbBins / 10.0 + 1)) *
                        255;
			}
			else if(this.activeSqr){
				tmp_value =
				(Math.pow(value, 2) / Math.pow(nbBins, 2)) * 255;
			}
			else if(this.activeAsin){
				tmp_value =
				(Math.log(value + Math.sqrt(Math.pow(value, 2) + 1.0)) /
					Math.log(
						nbBins + Math.sqrt(Math.pow(nbBins, 2) + 1.0)
					)) *
					255;
			}
			else{
				tmp_value = (value / nbBins) * 255;
			}
			spline.push(tmp_value);
		}
		let x = Array[this.histogramme.length];
		let splineData = [
			{
				x: x,
				y: spline,
				line: {shape: 'spline'},
				type: 'scatter',
				name: 'trace function',
				id: 'spline_histo'
			}
		];
		Plotly.addTraces('histogramme', splineData);
		this.traceAdded = true;
	}


	/**
	 * Compute Values To DataCube After Threshold
	 * @function computeValuesToDataCubeAfterThreshold
	 */
	computeValuesToDataCubeAfterThreshold(range : any) {
		console.log(this.image);
		let newImageAfterThreshold: any = [];
		if(range == undefined){
			range = {min:0,max:255};
		}


		newImageAfterThreshold = this.image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				let tmp = 0;
				if(this.activeLinear){
					tmp = (ji - range.min ) / (range.max - range.min) * 255;
				}
				else if(this.activeExpo){
					tmp = Math.sqrt(ji - range.min + 1) / Math.sqrt(range.max - range.min + 1);
				}
				else if(this.activeSqr){
					tmp = Math.exp(ji - range.min + 1) / Math.exp(range.max - range.min + 1);
				}
				else if(this.activeAsin){
					tmp = Math.asin(ji - range.min + 1) / Math.asin(range.max - range.min + 1);
				}
				else{
					tmp = (ji - range.min ) / (range.max - range.min) * 255;
				}
				return tmp;
			});
		});

		this.newImageEmitter.emit(newImageAfterThreshold);	
	}

	/**
	 * Histogram Setter Function
	 * @function setHistogram
	 * @param {any} x - X Axis array
	 */
	setHistogram(x: any) {
		this.histogramme = x;
		const data = [
			{
				x: x,
				type: 'histogram',
				autobinx: false,
				xbins: {
					end: 256,
					size: 1,
					start: -.5
				}
			}
		];

		const layout = {
			yaxis: {
				fixedrange: true
			},
			margin: {
				l: 40,
				r: 40,
				t: 40,
				b: 40
			}
		};

		Plotly.newPlot('histogramme', data, layout);
	}

	getRange() {
		const myHisto = <CustomHTMLElement>document.getElementById('histogramme');
		const range = {
			'min': <any>null,
			'max': <any>null
		};
		myHisto.on('plotly_relayout', (eventData: any) => {
			range.min = eventData['xaxis.range[0]'];
			range.max = eventData['xaxis.range[1]'];
			
			if(range.min !== undefined){
				this.computeValuesToDataCubeAfterThreshold(range);
			}			
			return range;
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
				return ji = ( ji / 256 ) * this.hmax
			});
		});

		this.newImageEmitter.emit(newImageLinear);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
		this.drawTransferFunction();
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
				return ji = Math.sqrt(ji / 10.0) / Math.sqrt(256 / 10.0) * this.hmax;
			});
		});

		this.newImageEmitter.emit(newImageExpo);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
		this.drawTransferFunction();
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
				return ji = Math.pow(ji, 2) / Math.pow(256, 2) * this.hmax;
			});
		});

		this.newImageEmitter.emit(newImageSqr);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
		this.drawTransferFunction();
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
				return ji = Math.log(ji + Math.sqrt(Math.pow(ji, 2) + 1.0 )) /
							Math.log(256 + Math.sqrt( Math.pow(256, 2) + 1.0 )) * this.hmax;
			});
		});

		this.newImageEmitter.emit(newImageAsin);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
		this.drawTransferFunction();
	}

	/**
	 * Reset histogram function
	 * @function resetHisto
	 */
	resetHisto() {
		this.deleteTransferFunction();
		this.activeExpo = false;
		this.activeLinear = false;
		this.activeAsin = false;
		this.activeSqr = false;
		this.traceAdded = false;		
		this.newImageEmitter.emit(this.slideData);
		this.newResetEmitter.emit(null);
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
