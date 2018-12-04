import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { ScatterData, Layout, PlotlyHTMLElement, newPlot } from 'plotly.js/lib/core';
import { CubeToSpectreService } from '../../shared/services/cube-to-spectre.service';
import { SpectreService } from './spectre.service';
import { Subscription } from 'rxjs/Subscription';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { LoaderService } from '../../core/loader.service';
import { Fit } from '../../shared/classes/fit';
import * as Plotly from 'plotly.js';
import { CustomHTMLElement } from '../../shared/classes/custom-html';
//declare function require(moduleName: string): any;
//const Plotly = require('plotly.js/lib/index-cartesian.js');

@Component({
	selector: 'app-spectre',
	templateUrl: './spectre.component.html',
	styleUrls: ['./spectre.component.scss']
})
export class SpectreComponent implements OnInit {
	@Output()
	spectreLoadingStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
	mustBeLoaded : boolean;
	dataCubePoint: any;
	subscription: Subscription;
	resetSubscription: Subscription;
	traceNumberSubscription: Subscription;
	lastTrace: number = 0;
	spectreName: number = 0
	isLoadingSpectre: Boolean = true;
	currentSlide: any = new Fit(null);
	spectreData: any = [];
	serviceSpectre : SpectreService;

	/**
	 * Constructor of spectre component
	 * @constructor
	 * @param {I18nService} i18nService - Translate service provider
	 * @param {CubeToSpectreService} cubeToSpectreService
	 * @param {StreamFitService} streamFitService - Fit file getter service provider
	 * @param {SpectreService} spectreService
	 */
	constructor(private i18nService: I18nService,
				private cubeToSpectreService: CubeToSpectreService,
				private streamFitService: StreamFitService,
				private loaderService: LoaderService,
				private spectreService: SpectreService) {
		this.mustBeLoaded = this.loaderService.spectre;
		if(this.mustBeLoaded){
			streamFitService.FitFile$.subscribe(fit => {
				this.currentSlide = new Fit(fit);
				this.ngOnInit();
			});
		}		

		this.subscription = cubeToSpectreService.CubePointCoord$.subscribe(coord => {		
			this.dataCubePoint = coord;
			this.lastTrace++;
			this.serviceSpectre = spectreService;
			this.getSpectrum(this.currentSlide.name, this.dataCubePoint.coordX, this.dataCubePoint.coordY);
		},
		error => { console.log('error:', error)});
		console.log('subscription', this.subscription);

		this.resetSubscription = cubeToSpectreService.ResetGraph$.subscribe(reset => {
			if (reset) {
				let nbSpectreTraces = this.lastTrace;
				const	tabToDelete = <any>[];

				for ( nbSpectreTraces; nbSpectreTraces > 0; nbSpectreTraces-- ) {
					tabToDelete.push(-nbSpectreTraces);
				}

				Plotly.deleteTraces('graphDiv', tabToDelete).then(() => {
					this.lastTrace = 0;
					this.spectreName = 0;
				});
			}
		});

		this.traceNumberSubscription = cubeToSpectreService.CubeTrace$.subscribe(traceNumber => {
			const graphDiv = <CustomHTMLElement>document.getElementById('graphDiv');
			if(graphDiv.data[traceNumber-1].visible == undefined || graphDiv.data[traceNumber-1].visible == true){
				graphDiv.data[traceNumber-1].visible = false;
			}
			else{
				graphDiv.data[traceNumber-1].visible = true;
			}
			
			Plotly.redraw(graphDiv);
		});	
	}

	/**
	 * Get all points of spectre from x and y
	 * @function getSpectrum
	 * @return array of points
	 */
	getSpectrum(name : string, x: any, y: any) : any {
		this.serviceSpectre
		.getSpectre({id: name},
					{naxis1: x, naxis2: y})
		.finally(() => { this.spectreLoadingStatus.emit(false);  })
		.subscribe((spectreData: any) => {
			console.log(spectreData);
			this.spectreData = spectreData;
			if(this.mustBeLoaded){
				this.spectreName++;
				this.spectreData = [
					{
						x: this.spectreData.feature.properties.spectrum.wavelength,
						y: this.spectreData.feature.properties.spectrum.value,
						line: {shape: 'spline'},
						type: 'scatter',
						name: 'trace ' + this.spectreName
					} as ScatterData
				];

				const data = this.spectreData;

				Plotly.addTraces('graphDiv', data);
			}
		});
		return this.spectreData;
	}

	/**
	 * Initialize the spectre graph
	 * @function ngOnInit
	 */
	ngOnInit() {
		/* if(this.mustBeLoaded == 'true'){
			const data: any = [],
						layout = {
							title: 'Wave Tab (um)',
							xaxis: {
								title: 'Wave length',
								showgrid: false,
								zeroline: false
							},
							yaxis: {
								title: 'Percent',
								showline: false
							}
						};

			Plotly.newPlot('graphDiv', data, layout);
			this.changeVisibleTrace();
		} */
	}

	/**
	 * Actions made after the init view
	 * @function ngAfterViewInit
	 */
	ngAfterViewInit() {
		if(this.mustBeLoaded){
			const data: any = [],
						layout = {
							title: 'Wave Tab (um)',
							xaxis: {
								title: 'Wave length',
								showgrid: false,
								zeroline: false
							},
							yaxis: {
								title: 'Percent',
								showline: false
							}
						};

			Plotly.newPlot('graphDiv', data, layout);
			this.changeVisibleTrace();
		}
	  }

	/**
	 * Send to DataCube the spectre number hidden
	 * @function changeVisibleTrace
	 */
	changeVisibleTrace(): void{
		const _cubeToSpectreService = this.cubeToSpectreService, 
		myPlot = <CustomHTMLElement>document.getElementById('graphDiv');
		myPlot.on('plotly_legendclick', (data: any) => {
			_cubeToSpectreService.shareSpectreTraceNumber(data.curveNumber+1);
		});
	}

	/**
	 * Set the language
	 * @function setLanguage
	 */
	setLanguage(language: string) {
		this.i18nService.language = language;
	}

	/**
	 * Get the current language
	 * @function currentLanguage
	 */
	get currentLanguage(): string {
		return this.i18nService.language;
	}

	/**
	 * Get all languages
	 * @function currentLanguage
	 */
	get languages(): string[] {
		return this.i18nService.supportedLanguages;
	}
}
