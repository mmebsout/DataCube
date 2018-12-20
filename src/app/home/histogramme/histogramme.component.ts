import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { SlideService } from '../dataCube/slide.service';
import { LoaderService } from '../../core/loader.service';
import { Fit } from '../../shared/classes/fit';
import { CustomHTMLElement } from '../../shared/classes/custom-html';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { forEach } from '@angular/router/src/utils/collection';
import { anyTypeAnnotation } from 'babel-types';

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
	tmin :number = 0;
	histo_transfer : any = [];
	pathData: string = null;


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
		private streamFitService: StreamFitService, public toastr: ToastsManager) {
		this.mustBeLoaded = this.loaderService.histogramme;

		if(this.loaderService.fileData != null){
			this.currentSlide = new Fit(this.loaderService.fileData);
		}

		streamFitService.FitFile$.subscribe(fit => {
			if(this.loaderService.dataPath != null && this.loaderService.dataPath != undefined){
				this.pathData = this.loaderService.dataPath;
			}	
			/* if(this.loaderService.fileData != null){
				this.currentSlide = new Fit(this.loaderService.fileData);
			}else{ */
			this.currentSlide = new Fit(fit);
			//}				
			this.ngOnInit();
		});
	}

	transformArrayHistogramme( array : any) {
		let test= new Array(255);
		let test_tmp= new Array(255);
		for (let i = 0; i < test.length; i++) {
			test[i]=0;
			test_tmp[i]=0;
		}
		//console.log(array);
		/* _.forEach(array, function(value: any, key : any) {
			if(value !== undefined){
				console.log(key+" "+value["index"]+" "+value["cpt"]);			
				test[value["index"]]+=value["cpt"];	
			}					
		  }); */
		  //test = _.groupBy(array, "index");
		 /*  test_tmp = _.forEach(test, function(value: any, key : any) {
			value["index"] = value["index"]+ value["cpt"];
			}); */
		  test = _.groupBy(array, "index");
		  //console.log(test);
		  _.forEach(test, function(value: any, key : any) {
			if(test_tmp[key]==undefined){
				test_tmp[key]=0;
			}
			let somme = _.sumBy(value, "cpt");
			//console.log(somme);
			test_tmp[key] = somme;
			});
		 //console.log(test_tmp);
		return test_tmp;
		//console.log(arrayGroupBy);
		//_.sumBy(array, function(o:any) { return o["cpt"]; });
	}

	swap(json : any) {
		let ret = [];
		for(let key in json){
		  ret[json[key]] = key;
		}
		return ret;
	  }

	strToFloat(value: any) {
		  value=String(value)			
		  return Number(value);
	  }

	/**
	 * Histogram Init Function
	 */
	ngOnInit() {
		this.slideService
			.getSlide({id: this.currentSlide.name, path : this.pathData})
			.finally(() => {
				this.histoLoadingStatus.emit(false);
			})
			.subscribe(slideData => {
				let role:  any = null;
				role = JSON.parse(localStorage.getItem('userNameRole'));
				let list: any = localStorage.getItem('listfilesPublic').split(",");
				//console.log(list);
				if((localStorage.getItem('userNameDataCube')=="admin") 
				|| ((localStorage.getItem('userNameDataCube')!=="admin") && (role=="public" && list.indexOf(this.currentSlide.name)!==-1))
				){
					this.slideData = slideData;
					if(this.slideData.feature instanceof Object) {
						this.image = this.slideData.feature.properties.slide.value;
						let max = 0, tmax = 0, min = 0, tmin = 0;
						let val = <any>[];
						let result_final = <any>[];
						const colorLength = 256;
						this.image.map((xi: any, i: number) => {
							max = Math.max.apply(null, xi);
							min = Math.min.apply(null, xi);
							if (max > tmax) {
								tmax = max;
							}
		
							if (min < this.tmin) {
								this.tmin = min;
							}
		
							xi.map((ji: any, j: number) => {
								val.push(ji);
								result_final.push(Number(ji).toFixed(20));
							});
						});
						let hist_tmp = new Array(colorLength);
						let hist = new Array();
						let result = new Array(colorLength);
		
						for (let i = 0; i < colorLength; i++) {
							result[i] = 0;
						}
		
						let hmax = Number.MIN_VALUE;
						
						for (let i = 0; i < val.length; i++) {
							const bin = (val[i]==null)?0:val[i].toPrecision(1);							
							//hist[bin]=0;
							hist_tmp[bin]=0;
							
						}
						for (let i = 0; i < val.length; i++) {
							let bin = (val[i]==null)?0:val[i].toPrecision(1);
							//console.log(bin);							
							//let index = hist.indexOf(bin);
							//(index==-1)?hist[1]=bin:hist[index+1]=bin;
							//console.log(index);
							//hist[index]=0;
							
							
							hist_tmp[Number(bin)]++;

							//hist_tmp[]=Number(bin);
							// Compute histogram max value
							if (hist_tmp[Number(bin)] > this.hmax) {
								this.hmax = hist_tmp[Number(bin)];
							}

							//console.log(hist_tmp);
							//hist.push({'index':Number(bin),'cpt':Number(hist_tmp[bin])});
							
						}
						//hist_tmp = this.transformArrayHistogramme(hist);	
						//hist_tmp = _.find(hist_tmp, function(o:any) { return o>0; });
						let y:any;
						hist_tmp = this.swap(hist_tmp);
						//console.log(hist_tmp);
						this.histo_transfer = hist_tmp;
						_.forEach(hist_tmp, function(value: any, key : any) {
							//console.log(hist_tmp[key]);
							if(hist_tmp[key]!==undefined){
								//console.log(Number(String(hist_tmp[key])));
								result[key] =Number(hist_tmp[key]).toFixed(20);
							}
							else{
								result[key] = 0;
							}
						});
						tmin = _.min(result);
						//console.log(result);
						if(this.mustBeLoaded){
							this.setHistogram(result_final);
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
		//console.log(this.histo_transfer);
		if (this.traceAdded) {
			this.deleteTransferFunction();
		}
		let spline : any = [];
		let tmp_value = 0;
		let x : any = [];

		if(this.activeLinear){
			_.forEach(this.histo_transfer, function(value: any, key : any) {
				//console.log(value);
				if(value >= 0){
					x.push(value);
				}			
				spline.push(key);
			});
			
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


			let tmp = [];
			for(let i=0;i<spline.length;i++){
				//console.log(spline[i]);
				if(spline[i] % 5 == 0){
					tmp.push(spline[i]);
				}
				//return value % 5 == 0;
			};
			//spline = tmp;
		//console.log(x);
		//console.log(spline);
		spline = _.forEach(spline, function(value: any, key : any) {
			//console.log(max);
			//return value <= 35;
		});
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
		//console.log(range);
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
			newImageAfterThreshold = this.image.map((xi: any, i: number) => {
				return xi.map((ji: any) => {
					tmp = (ji - range.min ) / (range.max - range.min) * 255;
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
		
		this.histogramme = x;
		//console.log(this.histogramme);
		const data = [
			{
				x: x,
				type: 'histogram',
				/* autobinx: true,
				xbins: {
					end: this.tmin,
					size: 1,
					start: -.5
				} */
			}
		];

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

		Plotly.newPlot('histogramme', data, layout);
	}

	getRange() {
		const myHisto = <CustomHTMLElement>document.getElementById('histogramme');
		const range = {
			'min': <any>null,
			'max': <any>null
		};
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
