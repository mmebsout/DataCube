import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { ScatterData, Layout, PlotlyHTMLElement, newPlot } from 'plotly.js/lib/core';
import { CubeToSpectreService } from '../../shared/services/cube-to-spectre.service';
import { SpectreService } from './spectre.service';
import { Subscription } from 'rxjs/Subscription';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { Fit } from '../../shared/classes/fit';

declare function require(moduleName: string): any;
const Plotly = require('plotly.js/lib/index-cartesian.js');

@Component({
	selector: 'app-spectre',
	templateUrl: './spectre.component.html',
	styleUrls: ['./spectre.component.scss']
})
export class SpectreComponent implements OnInit {
	@Output()
	spectreLoadingStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

	dataCubePoint: any;
	subscription: Subscription;
	resetSubscription: Subscription;
	lastTrace: number = 0;
	isLoadingSpectre: Boolean = true;
	currentSlide: any = new Fit(null);
	spectreData: any = [];

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
				private spectreService: SpectreService) {

		streamFitService.FitFile$.subscribe(fit => {
			console.log('reception Fit', fit);
			this.currentSlide = new Fit(fit);
			this.ngOnInit();
		});

		console.log('constructor spectre', cubeToSpectreService.CubePointCoord$);
		this.subscription = cubeToSpectreService.CubePointCoord$.subscribe(coord => {
			console.log('im in');
			console.log('coordSpectre', coord);
			this.dataCubePoint = coord;
			this.lastTrace++;

			spectreService
				.getSpectre({id: this.currentSlide.name},
							{naxis1: this.dataCubePoint.coordX, naxis2: this.dataCubePoint.coordY})
				.finally(() => { this.spectreLoadingStatus.emit(false);  })
				.subscribe((spectreData: any) => {
					this.spectreData = spectreData;

					console.log('Spectre Data:', spectreData);

					this.spectreData = [
						{
							x: this.spectreData.feature.properties.spectrum.wavelength,
							y: this.spectreData.feature.properties.spectrum.value,
							line: {shape: 'spline'},
							type: 'scatter'
						} as ScatterData
					];

					const data = this.spectreData;

					Plotly.addTraces('graphDiv', data);
				});
		},
		error => { console.log('error:', error)});
		console.log('subscription', this.subscription);

		this.resetSubscription = cubeToSpectreService.ResetGraph$.subscribe(reset => {
			if (reset) {
				console.log('reset in progress');
				let nbSpectreTraces = this.lastTrace;
				const	tabToDelete = <any>[];

				for ( nbSpectreTraces; nbSpectreTraces > 0; nbSpectreTraces-- ) {
					tabToDelete.push(-nbSpectreTraces);
				}

				Plotly.deleteTraces('graphDiv', tabToDelete).then(() => {
					this.lastTrace = 0;
				});
			}
		});
	}

	/**
	 * Initialize the spectre graph
	 * @function ngOnInit
	 */
	ngOnInit() {
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
