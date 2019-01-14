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
	histo_transfer : any = [];
	// pathData: string = null;
	tmin = <number>0;
	tmax = <number>0;
	//TODO change number of bins
	nbBins = <number>255;
	colorscale = <string>"";


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
		this.mustBeLoaded = this.loaderService.histogramme;

		this.cubeToHistoService.Colorscale$.subscribe(color => {			
			this.setColor(color);
		});


		if(this.loaderService.fileData != null){
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

	setColor(color:string){
		this.colorscale = color;
	}

	swap(json : any) {
		let ret = [];
		for(let key in json){
		  ret[json[key]] = key;
		}
		return ret;
	}

	getHMAX(val : any, hist_tmp : any) {
		this.hmax = Number.MIN_VALUE;
						
		for (let i = 0; i < val.length; i++) {
			const bin = (val[i]==null)?0:val[i].toPrecision(1);							
			hist_tmp[bin]=0;
			
		}
		for (let i = 0; i < val.length; i++) {
			let bin = (val[i]==null)?0:val[i].toPrecision(1);						
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
			.getSlide({id: this.currentSlide.name})
			.finally(() => {
				this.histoLoadingStatus.emit(false);
			})
			.subscribe(slideData => {
				//get user role
				let role:  any = null;
				role = JSON.parse(localStorage.getItem('userNameRole'));

				//get list files authorized
				let list: any = localStorage.getItem('listfilesPublic').split(",");

				//check if user is authorized
				if((localStorage.getItem('userNameDataCube')=="admin") 
				|| ((localStorage.getItem('userNameDataCube')!=="admin") && (role=="public" && list.indexOf(this.currentSlide.name)!==-1))
				){
					this.slideData = slideData;
					if(this.slideData.feature instanceof Object) {
						this.image = this.slideData.feature.properties.slide.value;
						
						let val = <any>[];
						let result_final = <any>[];
						const colorLength = 256;
						this.image.map((xi: any, i: number) => {		
							xi.map((ji: any, j: number) => {
								val.push(ji);
								//result_final.push(Number(ji).toFixed(20));
							});
						});
						let hist_tmp = new Array(colorLength);
						// let result = new Array(colorLength);
		
						// for (let i = 0; i < colorLength; i++) {
						// 	result[i] = 0;
						// }
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
						console.log(this.tmin+ " "+this.tmax);
						// let step = this.tmax/255;
						// let test=<any>[];
						// for(let i=this.tmin;i<this.tmax;i-step){
						// 	test.push(i);
						// }
						// console.log(test);

						this.getHMAX(val, hist_tmp);						

						hist_tmp = this.swap(hist_tmp);
						this.histo_transfer = hist_tmp;
						// _.forEach(hist_tmp, function(value: any, key : any) {
						// 	if(hist_tmp[key]!==undefined){
						// 		result[key] =Number(hist_tmp[key]).toFixed(20);
						// 	}
						// 	else{
						// 		result[key] = 0;
						// 	}
						// });
						if(this.mustBeLoaded){
							this.setHistogram(val);
							const r = this.getRange();
						}	
					}
				}
				else{
					this.toastr.error("Forbidden", 'Oops!');		
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
		//TODO repère pour Jean-Christophe transfer function
		if (this.traceAdded) {
			this.deleteTransferFunction();
		}
		let spline : any = [];
		let x : any = [];
		let nbBins = 255;

		if(this.activeLinear){
			_.forEach(this.histo_transfer, function(value: any, key : any) {
				// if(value >= 0){
				// 	x.push(value);
				// }			
				spline.push(key);
			});
			for (let i = 0; i < nbBins; i++) {
				let value = i;
				x.push(value / nbBins);
			}
		}
		else if(this.activeExpo){
			_.forEach(this.histo_transfer, function(value: any, key : any) {
				if(value >= 0){
					x.push(value);
				}	
				spline.push(Math.sqrt(key));
			});
			
		}
		else if(this.activeSqr){
			_.forEach(this.histo_transfer, function(value: any, key : any) {
				if(value >= 0){
					x.push(value);
				}
				spline.push(Math.pow(2, key));
			});
		}
		else if(this.activeAsin){
			_.forEach(this.histo_transfer, function(value: any, key : any) {
				if(value >= 0){
					x.push(value);
				}
				spline.push(Math.asin(value));
			});
		}
		x = _.orderBy(x,Number,['asc']);

		console.log(x);
		console.log(spline);	

		//add spline on histogramm
		let splineData = [
			{
				x: x,
				y: spline,
				line: {shape: 'spline'},
				type: 'scatter',
				name: 'trace function',
				id: 'spline_histo',
				legend: {"orientation": "v"}
			}
		];
		Plotly.addTraces('histogramme', splineData);
		this.traceAdded = true;
	}


	/**
	 * Compute Values To DataCube After Threshold
	 * @function computeValuesToDataCubeAfterThreshold
	 * @param {any} range thresold
	 */
	computeValuesToDataCubeAfterThreshold(range : any) {
		//TODO repère pour Jean-Christophe thresold histogramme
		let newImageAfterThreshold: any = [];
		if(range == undefined){
			range = {min:0,max:255};
		}

		let tmp = 0;
		if(this.activeLinear){
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					tmp = 0;
					tmp = (ji - range.min ) / (range.max - range.min) * 255;
					return tmp;
				})
			});
		}
		else if(this.activeExpo){
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					tmp = Math.sqrt(ji - range.min + 1) / Math.sqrt(range.max - range.min + 1);
					return tmp;
				})
			});
		}
		else if(this.activeSqr){
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					tmp = Math.exp(ji - range.min + 1) / Math.exp(range.max - range.min + 1);
					return tmp;
				})
			});
		}
		else if(this.activeAsin){
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					tmp = Math.asin(ji - range.min + 1) / Math.asin(range.max - range.min + 1);
					return tmp;
				})
			});
		}
		else{

			//TODO if grey coloscale put black color if value<min and white if value > max
			if(this.colorscale=="Greys"){
				//get image values with value between range min and range max
				newImageAfterThreshold = this.image.map((xi: any, i: number) => {
					return xi.map((ji: any) => {
						if(ji<range.min && ji != null){
							return this.tmin;
						}
						else 
						if(ji>= range.min && ji <= range.max){
							return ji;
						}
						else if( ji > range.max){
							return this.tmax;
						}
					})
				});
			}else{
				//get image values with value between range min and range max
				newImageAfterThreshold = this.image.map((xi: any, i: number) => {
					return xi.map((ji: any) => {					
						if(ji>= range.min && ji <= range.max){
							return ji;
						}						
					})
				});
			}

		}
		this.newImageEmitter.emit(newImageAfterThreshold);	
	}

	/**
	 * Histogram Setter Function
	 * @function setHistogram
	 * @param {any} x - X Axis array
	 */
	setHistogram(x: any) {
		
		this.histogramme = x;

		//data to build histogramm
		const data = [
			{
				x: x,
				type: 'histogram',
				nbinsx:this.nbBins
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

		Plotly.newPlot('histogramme', data, layout, {responsive: true});
	}

	/**
	 * Get range histogramm and call threshold Datacube
	 * @function getRange
	 * @returns range min and range max
	 */
	getRange() {
		const myHisto = <CustomHTMLElement>document.getElementById('histogramme');
		const range = {
			'min': <any>null,
			'max': <any>null
		};
		//if user change the range
		myHisto.on('plotly_relayout', (eventData: any) => {
			if(eventData["xaxis.range"]!==undefined){
				range.min = eventData["xaxis.range"][0];
				range.max = eventData["xaxis.range"][1];
				if(range.min !== undefined){
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
		//TODO repère pour Jean-Christophe linear to datacube
		this.activeLinear = true;
		this.activeExpo = false;
		this.activeSqr = false;
		this.activeAsin = false;
		let newImageLinear: any = [];
		this.filterBy = 'linear';

	 	newImageLinear = this.image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				let value=0;
				if(ji==null){
					value=ji;
				}else{
					value = ( ji / this.hmax ) * 255;
				}
				return value;
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
				let value=0;
				if(ji==null){
					value=ji;
				}else{
					value = ji = Math.sqrt(ji) / Math.sqrt(this.hmax) * 255;
				}
				return value;
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
				let value=0;
				if(ji==null){
					value=ji;
				}else{
					value = ji = Math.pow(ji, 2)/ Math.pow(this.hmax, 2) * 255;
				}
				return value;
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
				// Math.log(ji + Math.sqrt(Math.pow(ji, 2) + 1.0 )) /
				// 			Math.log(256 + Math.sqrt( Math.pow(256, 2) + 1.0 )) * this.hmax;
				let value=0;
				if(ji==null){
					value=ji;
				}else{
					value = ji = Math.asinh(ji) / Math.asinh(this.hmax)*255;
				}
				return value;
			});
		});

		this.newImageEmitter.emit(newImageAsin);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
		this.drawTransferFunction();
	}

	/**
	 * Reset histogram function and delete transfer function
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
