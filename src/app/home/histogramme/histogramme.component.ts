import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { SlideService } from '../dataCube/slide.service';
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
		private streamFitService: StreamFitService) {

		streamFitService.FitFile$.subscribe(fit => {
			console.log('reception Fit', fit);
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
				console.log(this.slideData);
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
				console.log('val length:', val.length);
				console.log('nbBins', hmax);
				this.setHistogram(hist);
				const r = this.getRange();
				console.log('range ==>', r);
			});
	}

	/**
	 * Histogram Setter Function
	 * @function setHistogram
	 * @param {any} x - X Axis array
	 */
	setHistogram(x: any) {
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
			console.log('ranger ====>', range);
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

		console.log ('Image: ', this.image);

	 	newImageLinear = this.image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				return ji = ( ji / 256 ) * this.hmax
			});
		});

		this.newImageEmitter.emit(newImageLinear);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
		console.log ('Linear Image: ', newImageLinear);
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

		console.log ('Image: ', this.image);
	 	newImageExpo = this.image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				return ji = Math.sqrt(ji / 10.0) / Math.sqrt(256 / 10.0) * this.hmax;
			});
		});

		this.newImageEmitter.emit(newImageExpo);
		this.newHmaxEmitter.emit(this.hmax);
		this.newResetEmitter.emit(this.filterBy);
		console.log ('Sqrt Image: ', newImageExpo);
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
	}

	/**
	 * Reset histogram function
	 * @function resetHisto
	 */
	resetHisto() {
		this.activeExpo = false;
		this.activeLinear = false;
		this.activeAsin = false;
		this.activeSqr = false;

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
