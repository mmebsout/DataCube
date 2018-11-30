import { Component, OnInit, ViewContainerRef,
	Output, Input, EventEmitter, OnChanges, SimpleChanges  } from '@angular/core';
import { Http, Response } from '@angular/http';
import { I18nService } from '../../core/i18n.service';
import { CubeToSpectreService } from '../../shared/services/cube-to-spectre.service';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { LoaderService } from '../../core/loader.service';
import { Fit } from '../../shared/classes/fit';
import { SlideService } from './slide.service';
import { MetadataService } from '../description/metadata.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { ImageRecalc } from '../../shared/classes/image-recalc';
import { CustomHTMLElement } from '../../shared/classes/custom-html';
//import * as Plotly from 'plotly.js-cartesian-dist';

declare function require(moduleName: string): any;
const Plotly = require('plotly.js/lib/index-cartesian.js');
// const Mizar = require('Mizar/Mizar.min.js');
const imgRedraw = new ImageRecalc;

@Component({
	selector: 'app-data-cube',
	templateUrl: './dataCube.component.html',
	styleUrls: ['./dataCube.component.scss']
})
export class DataCubeComponent implements OnInit, OnChanges {
	@Output()
	dataCubeLoadingStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	newImage: any;

	@Input()
	newFilterReset: any;

	@Input()
	newHmax: any;
	mustBeLoaded : boolean;
	isLoading = <boolean>true;
	dataCubePoint = <number>0;
	graphId = 'heatmap';
	dataTraces: any = [];
	layout: object = {};
	frames: any = [];
	slideData: any = [];
	fileType: any = [];
	val =  <number>1;
	val_opacity = <number>1.00;
	nbSlides =  <number>1;
	slideTrace = <number>0;
	currentSlide: any = new Fit(null);
	world: any = [];
	long: any = [];
	lat: any = [];
	currentTranche =  <number>1;
	filterImage: any = null;
	colors: any = [];
	traceNumberSubscription: Subscription;
	slideLoaded : number = 1;
	

	/**
	 * Constructor of DataCube component
	 * @constructor
	 * @param {Http} http
	 * @param {I18nService} i18nService - Translate service provider
	 * @param {CubeToSpectreService} cubeToSpectreService
	 * @param {SlideService} slideService
	 * @param {StreamFitService} streamFitService
	 * @param {MetadataService} metadataService
	 * @param {ToastsManager} toastr
	 * @param {ViewContainerRef} vcr
	 */
	constructor(private http: Http,
				private i18nService: I18nService,
				private translateService: TranslateService,
				private cubeToSpectreService: CubeToSpectreService,
				private slideService: SlideService,
				private streamFitService: StreamFitService,
				private metadataService: MetadataService,
				private loaderService: LoaderService,
				public toastr: ToastsManager,
				public vcr: ViewContainerRef) {
		this.mustBeLoaded = this.loaderService.datacube;
		toastr.setRootViewContainerRef(vcr);
		this.colors = Plotly.PlotSchema.get().layout.layoutAttributes.colorway.dflt;
		cubeToSpectreService.CubePointCoord$.subscribe(coord => {
			this.dataCubePoint = coord;
		});

		streamFitService.FitFile$.subscribe(fit => {
			this.currentSlide = new Fit(fit);
			this.ngOnInit();
		});
	
	}

	ngOnInit() {
		this.initSlide();
	}

	/**
	 * DataCube Init Function
	 * @function ngOnInit
	 */
	ngAfterViewInit() {
		
	}

	ngOnChanges(changes: SimpleChanges) {
		if ( this.newImage ) {
			this.deleteCurrentGraph();
			this.setPlotly(changes.newImage.currentValue, this.long, this.lat);
			this.selectedCoord();			
		}
	
	}

	/**
	 * DataCube first slide image init Function
	 * @function initSlide
	 */
	initSlide() {
		this.metadataService
			.getDimension({id: this.currentSlide.name})
			.finally(() => {
				this.translateService.get(['messageDataCube','success']).subscribe((res: any) => {
					this.toastr.success(res.messageDataCube, res.success);
					this.dataCubeLoadingStatus.emit(false);
				  });				
			})
			.subscribe((dimensions: any) => {
				if(dimensions.feature instanceof Object) {
					this.nbSlides = dimensions.feature.properties.dimensions.dimZ;
					this.world = dimensions.feature.properties.dimensions;
	
					for (let i = 0; i < this.world.dimX; i++) {
						this.long.push(i * this.world.stepX + this.world.refLon);
					}
	
					for (let j = 0; j < this.world.dimY; j++) {
						this.lat.push(j * this.world.stepY + this.world.refLat);
					}
				}	
				else {
					this.toastr.error(dimensions, 'Oops!')
				}			
			});

		this.slideService
			.getSlide({id: this.currentSlide.name})
			.finally(() => {				
				this.translateService.get(['cubeExplorerImage','success']).subscribe((res: any) => {
					this.toastr.success(res.cubeExplorerImage, res.success);
				  });
				this.dataCubeLoadingStatus.emit(false);
			})
			.subscribe(slideData => {
					this.fileType = slideData;
					if(this.fileType.feature instanceof Object) {

					if (this.fileType.feature.properties.fileType !== 'mizar') {
						this.setPlotly(slideData, this.long, this.lat);
					} else {
						// TODO
						// this.setMizar(slideData);
					}
	
					this.selectedCoord();
					this.changeVisibleTrace();
					this.traceNumberSubscription = this.cubeToSpectreService.SpectreTrace$.subscribe(traceNumber => {
						const graphDiv = <CustomHTMLElement>document.getElementById(this.graphId);
						if(graphDiv.data[traceNumber].visible == undefined || graphDiv.data[traceNumber].visible == true){
							graphDiv.data[traceNumber].visible = false;
						}
						else{
							graphDiv.data[traceNumber].visible = true;
						}
						Plotly.redraw(graphDiv);
					});	
				}
				else {
					this.toastr.error(this.fileType, 'Oops!')
				}
				
			});
	}

/**
	 * DataCube slider for slide opacity
	 * @function sliderSelectOpacity
	 */
	sliderSelectOpacity(long: any, lat: any) {
		Plotly.restyle(this.graphId, 'opacity', this.val_opacity, [0]);
	 	let id : number = 0;
		id = Number(this.val.toFixed()) + 1;
		if(this.val_opacity<1 && id <= this.nbSlides && (this.slideLoaded != id)){			
			this.slideService
			.getNextTranche({id: this.currentSlide.name}, {idTranche: id})
			.finally(() => {})
			.subscribe((figure: any) => {
				this.slideData = figure.feature.properties.slide.value;
			});
			this.slideLoaded = id;
			const text = lat.map((xi: any, i: number) => long.map((yi: any, j: number) => `
			Long & Lat:<br> (${yi} , ${xi})`));
			const sliderData = 
			{
				z: this.slideData,
				hoverinfo: 'z+text',
				zsmooth: 'best',
				type: 'heatmap',
				text: text,
				colorbar: {
					thickness: 15,
					xpad: 5
				},
				showscale : false
			};
			console.log("avant delete :");
			this.dataTraces.map((obj: any, index: number) => {
				console.log(obj);
			});
			if(this.dataTraces.length == 2){
				this.deleteCurrentGraph();
			}			
			Plotly.addTraces(this.graphId, sliderData);
			Plotly.restyle(this.graphId, 'opacity', 0.6 , [1]);
			console.log("apres delete :");
			this.dataTraces.map((obj: any, index: number) => {
				console.log(obj);
			});
		} 
	}

	/**
	 * DataCube slider for slide image function
	 * @function sliderSelectSlide
	 * @param {number} indexval
	 * @param {any} long
	 * @param {any} lat
	 */
	sliderSelectSlide(indexVal: number, long: any, lat: any): void {

		this.slideService
			.getNextTranche({id: this.currentSlide.name}, {idTranche: indexVal})
			.finally(() => {
				if(this.translateService.currentLang == 'en-US') {
					this.toastr.success(`Slide Nb  ${indexVal + 1} is loaded!`, `Success!`);
				} else {
					this.toastr.success(`Slide numéro  ${indexVal + 1} est chargée!`, `Succès!`);
				}				
				this.currentTranche = indexVal;
			})
			.subscribe((figure: any) => {			
				const img = figure.feature.properties.slide.value;
			if (this.newFilterReset) {
				switch (this.newFilterReset) {
					case ('linear'):
						this.slideData = imgRedraw.linear(this.newHmax, img);
					break;
					case ('expo'):
						this.slideData = imgRedraw.expo(this.newHmax, img);
					break;
					case ('sqr'):
						this.slideData = imgRedraw.sqr(this.newHmax, img);
					break;
					case ('asin'):
						this.slideData = imgRedraw.asin(this.newHmax, img);
					break;
				}
			} else {
				this.slideData = img;
			}

			const text = lat.map((xi: any, i: number) => long.map((yi: any, j: number) => `
			Long & Lat:<br> (${yi} , ${xi})`));

			const sliderData = 
				{
					z: this.slideData,
					hoverinfo: 'z+text',
					text: text,
					zsmooth: 'best',
					type: 'heatmap',
					colorbar: {
						thickness: 15,
						xpad: 5
					}
				}
			;

			this.deleteCurrentGraph();

			Plotly.addTraces(this.graphId, sliderData);
			Plotly.restyle(this.graphId, 'opacity', this.val_opacity, [0]);
		});
	}

	/**
	 * DataCube image builder setter function
	 * @function setPlotly
	 * @param {any} slideData
	 * @param {any} long
	 * @param {any} lat
	 */
	setPlotly(slideData: any, long: any, lat: any) {
		this.slideData = slideData;
		if ( !(Array.isArray(this.slideData)) ) {
			this.slideData = this.slideData.feature.properties.slide.value;
		}

		const text = lat.map((xi: any, i: number) => long.map((yi: any, j: number) => `
			Long & Lat:<br> (${yi} , ${xi})`));

		this.val = 1;
		this.dataTraces = [
			{
				z: this.slideData,
				hoverinfo: 'z+text',
				text: text,
				zsmooth: 'best',
				type: 'heatmap',
				colorbar: {
					thickness: 15,
					xpad: 5
				}
			}
		];
		const layout = {			
			margin: {
				l: 40,
				r: 40,
				t: 40,
				b: 40
			},
			showlegend: true,
			legend: {"orientation": "h"}
		};
		const data = this.dataTraces;

		Plotly.newPlot(this.graphId, data, layout);
	}

	/**
	 * Mizar setter function
	 * @function setMizar
	 */
	setMizar(mizarData: any) {
		// TODO make the mizar init
			/* const mizar = new Mizar({
				canvas: 'MizarCanvas',
				skyContext: {
					coordinateSystem: {geoideName: Mizar.CRS.Mars_2000}
				}
			});

			const dssLayerID = mizar.addLayer({
				type: Mizar.LAYER.Hips,
				baseUrl: 'http://alasky.unistra.fr/DSS/DSSColor'
			});

			mizar.setBackgroundLayerByID(dssLayerID);

			const nav = mizar.getActivatedContext().getNavigation();
			nav.zoomTo([-160, 80], {
				callback: function() {
					nav.zoomTo([10, 80]);
				}
			}); */
	}

	/**
	 * Selected a specific plot on the image
	 * @function selectedCoord
	 */
	selectedCoord(): void {
		const _cubeToSpectreService = this.cubeToSpectreService,
			  myPlot = <CustomHTMLElement>document.getElementById(this.graphId);

		myPlot.on('plotly_click', (data: any) => {
			let pn = 0,
				tn = 0;

			for (let i = 0; i < data.points.length; i++) {
				pn = data.points[i].x;
				tn = data.points[i].y;
			};

			Plotly.addTraces(myPlot, {y: [tn], x: [pn]});
			
			Plotly.restyle(this.graphId, 'marker.color', this.colors[this.dataTraces.length-2], [this.dataTraces.length-1]);

			_cubeToSpectreService.shareCubePointCoord({coordX: pn, coordY: tn});
		});
	}

	/**
	 * Share click legend to spectre (change visibility)
	 * @function resetPlots
	 */
	changeVisibleTrace(): void{
		const _cubeToSpectreService = this.cubeToSpectreService, 
		myPlot = <CustomHTMLElement>document.getElementById(this.graphId);
		myPlot.on('plotly_legendclick', (data: any) => {
			_cubeToSpectreService.shareTraceNumber(data.curveNumber);
		});
	}

	/**
	 * Reset all plots from the image and the spectre
	 * @function resetPlots
	 */
	resetPlots() {
		const _cubeToSpectreService = this.cubeToSpectreService;

		const	tab = new Array;

		this.dataTraces.forEach((element: any, index: number) => {
			if (element.x) {
				tab.push(index);
			}
		});

		Plotly.deleteTraces(this.graphId, tab);
		_cubeToSpectreService.shareResetGraph(true);
	}

	/**
	 * Delete the given graph
	 * @function deleteCurrentGraph
	 */
	deleteCurrentGraph() {
	 	this.dataTraces.map((obj: any, index: number) => {
			if (obj.type === 'heatmap') {
				return Plotly.deleteTraces(this.graphId, index);
			}
		});
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
