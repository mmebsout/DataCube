import 'rxjs/add/operator/finally';

import { Component, OnInit, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { QuoteService } from './quote.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	quote: string;
	isLoadingCube = <boolean>true;
	isLoadingHisto = <boolean>true;
	isLoadingSpectre = <boolean>true;
	isLoadingDesc = <boolean>true;
	newFilterReset: any;
	newImage: any;
	newHmax: any;
	messageDataCubeLoading = <string> '';
	messageHistogrammeLoading = <string> '';
	messageSpectreLoading = <string> '';
	messageDescLoading = <string> '';

	/**
	 * Constructor of home component
	 * @constructor
	 */
	constructor(private quoteService: QuoteService, private ngZone: NgZone, private translateService: TranslateService) {}

	/**
	 * Initialize the responsive web design for all components
	 * @function ngOnInit
	 */
	ngOnInit() {
		this.translateService.get(['messageDataCubeLoading','messageHistogrammeLoading','messageSpectreLoading','messageDescLoading']).subscribe((res: any) => {
			this.messageDataCubeLoading = res.messageDataCubeLoading;
			this.messageHistogrammeLoading = res.messageHistogrammeLoading;
			this.messageSpectreLoading = res.messageSpectreLoading;
			this.messageDescLoading = res.messageDescLoading;
		  });
		const d3 = Plotly.d3;

		const WIDTH_IN_PERCENT_OF_PARENT = 100,
			HEIGHT_IN_PERCENT_OF_PARENT = 50,
			
			cube = this.setGraph('#heatmap', d3, WIDTH_IN_PERCENT_OF_PARENT, HEIGHT_IN_PERCENT_OF_PARENT),
			spectre = this.setGraph('#graphDiv', d3, WIDTH_IN_PERCENT_OF_PARENT, HEIGHT_IN_PERCENT_OF_PARENT),
			histo = this.setGraph('#histogramme', d3, WIDTH_IN_PERCENT_OF_PARENT, HEIGHT_IN_PERCENT_OF_PARENT);

		window.onresize = (e) => {
			this.ngZone.run(() => {
				Plotly.Plots.resize(cube);
				Plotly.Plots.resize(spectre);
				Plotly.Plots.resize(histo);
			});
		};
	}

	/**
	 * Set the responsive design for the incoming graph
	 * @function setGraph
	 * @param {string} className - HTML Id attribute of the graph
	 * @param {any} d3Object - Plotly d3 object
	 * @param {number} width - width in percent of parent
	 * @param {number} height - height in percent of parent
	 */
	setGraph (className: string, d3Object: any, width: number, height: number) {
		const gd3 = d3Object.select(className)
				.style({
						width: width + '%',
						'margin-left': (100 - width) / 2 + '%',

						height: height + 'vh',
						'margin-top': '0vh'
				}),
			name = gd3.node();

		return name;
	}

	/**
	 * Check if the module is loaded
	 * @function loadingChange
	 * @param {any} event - event emitter who return a boolean
	 */
	loadingChange(event: any) {
		this.isLoadingCube = event;
		this.isLoadingHisto = event;
		this.isLoadingSpectre = event;
		this.isLoadingDesc = event;
	}

	/**
	 * Check if the new image is available
	 * @function loadingNewImage
	 * @param {any} event - event emitter who return a new image as tab
	 */
	loadingNewImage(event: any) {
		this.newImage = event;
		//console.log('new image from the home', this.newImage);
	}

	/**
	 * Check if the new image is available
	 * @function loadingNewImage
	 * @param {any} event - event emitter who return a new image as tab
	 */
	loadingNewReseter(event: any) {
		this.newFilterReset = event;
		//console.log('new Filter from the home', this.newFilterReset);
	}

	/**
	 * Check if the new image is available
	 * @function loadingNewHmax
	 * @param {any} event - event emitter who return a new image as tab
	 */
	loadingNewHmax(event: any) {
		this.newHmax = event;
		//console.log('new Hmax from the home ==>', this.newHmax);
	}
}
