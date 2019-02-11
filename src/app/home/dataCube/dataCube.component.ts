import { Component, OnInit, ViewContainerRef,
	Output, Input, EventEmitter, OnChanges, SimpleChanges  } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router, CanActivate } from '@angular/router';
import { I18nService } from '../../core/i18n.service';
import { CubeToSpectreService } from '../../shared/services/cube-to-spectre.service';
import { CubeToHistoService } from '../../shared/services/cube-to-histo.service';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { LoaderService } from '../../core/loader.service';
import { Fit } from '../../shared/classes/fit';
import { SlideService } from './slide.service';
import { Logger } from '../../core/logger.service';
import { MetadataService } from '../description/metadata.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { ImageRecalc } from '../../shared/classes/image-recalc';
import { CustomHTMLElement } from '../../shared/classes/custom-html';

declare function require(moduleName: string): any;
const Plotly = require('plotly.js/lib/index-cartesian.js');
const imgRedraw = new ImageRecalc;
const log = new Logger('Datacube');

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
	// pathData: string = null;
	world: any = [];
	long: any = [];
	lat: any = [];
	currentTranche =  <number>1;
	filterImage: any = null;
	colors: any = [];
	traceNumberSubscription: Subscription;
	slideLoaded : number = 1;
	pixelsSelected: any = [];
	colorscale: string = "Jet";
	smooth_color: string = "best";
	text: string = "";

	/**
	 * Constructor of DataCube component
	 * @constructor
	 * @param {Http} http
	 * @param {I18nService} i18nService - Translate service provider
	 * @param {CubeToSpectreService} cubeToSpectreService
	 * @param {CubeToHistoService} CubeToHistoService
	 * @param {SlideService} slideService
	 * @param {StreamFitService} streamFitService
	 * @param {MetadataService} metadataService
	 * @param {ToastsManager} toastr
	 * @param {ViewContainerRef} vcr
	 */
	constructor(private router: Router, private http: Http,
				private i18nService: I18nService,
				private translateService: TranslateService,
				private cubeToSpectreService: CubeToSpectreService,
				private cubeToHistoService: CubeToHistoService,
				private slideService: SlideService,
				private streamFitService: StreamFitService,
				private metadataService: MetadataService,
				private loaderService: LoaderService,
				public toastr: ToastsManager,
				public vcr: ViewContainerRef) {


		//get if datacube must be loaded (plugin gestion)
		this.mustBeLoaded = this.loaderService.datacube;
		toastr.setRootViewContainerRef(vcr);
		this.colors = Plotly.PlotSchema.get().layout.layoutAttributes.colorway.dflt;
		cubeToSpectreService.CubePointCoord$.subscribe(coord => {
			this.dataCubePoint = coord;
		});
		if(this.loaderService.fileData != null){
			this.currentSlide = new Fit(this.loaderService.fileData);
		}

		//if data is laoded
		streamFitService.FitFile$.subscribe(fit => {

			//get user role
			let role:  any = null;
			role = JSON.parse(localStorage.getItem('userNameRole'));

			//get list files authorized
			let list: any = localStorage.getItem('listfilesPublic').split(",");

			//check if user is authorized
			if((localStorage.getItem('userNameDataCube')=="admin") 
			|| ((localStorage.getItem('userNameDataCube')!=="admin") && (role=="public" && list.indexOf(fit)!==-1))
			){
				// if(this.loaderService.dataPath != null && this.loaderService.dataPath != undefined){
				// 	this.pathData = this.loaderService.dataPath;
				// }
				this.currentSlide = new Fit(fit);
				this.ngOnInit();
			}else{
				this.toastr.error("Forbidden", 'Oops!')
			}
		});
	}

	ngOnInit() {
		this.initSlide();
	}

	/**
	 * Detect changes on Datacube
	 * @function ngOnChanges
	 */
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
			//get user role
			let role:  any = null;
			role = JSON.parse(localStorage.getItem('userNameRole'));

			//if no role redirect login
			if(role==undefined){
				this.router.navigate(['/login'], { skipLocationChange: true });
			}

			//get list files authorized
			let list: any = localStorage.getItem('listfilesPublic').split(",");

			//check if user is authorized
			if((localStorage.getItem('userNameDataCube')=="admin") 
			|| ((localStorage.getItem('userNameDataCube')!=="admin") && (role=="public" && list.indexOf(this.currentSlide.name)!==-1))
			){
			this.metadataService
				.getDimension({id: this.currentSlide.name})
				.finally(() => {
					//toastr translate if success
					this.translateService.get(['messageDataCube','success']).subscribe((res: any) => {
						this.toastr.success(res.messageDataCube, res.success);
						this.dataCubeLoadingStatus.emit(false);
					});
				})
				.subscribe((dimensions: any) => {
					if(dimensions.feature instanceof Object) {
						//get slides number
						this.nbSlides = dimensions.feature.properties.dimensions.dimZ;
						this.world = dimensions.feature.properties.dimensions;

						//get longitude
						for (let i = 0; i < this.world.dimX; i++) {
							this.long.push(i * this.world.stepX + this.world.refLon);
						}
						//get latitude
						for (let j = 0; j < this.world.dimY; j++) {
							this.lat.push(j * this.world.stepY + this.world.refLat);
						}
					}
					else {
						this.toastr.error(dimensions, 'Oops!');
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

						//share trace to spectre
						this.changeVisibleTrace();

						//if trace hidden into spectre then datacube redraw traces
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
						this.sliderSelectOpacity(this.long, this.lat);	
					}
					else {
						this.toastr.error(this.fileType, 'Oops!')
					}

				});
			}
			else{
				this.toastr.error("Forbidden", 'Oops!')
			}
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

			//tooltip on datacube
			this.text = lat.map((xi: any, i: number) => long.map((yi: any, j: number) => `
			Long & Lat:<br> (${yi} , ${xi})`));
			const sliderData =
			{
				z: this.slideData,
				hoverinfo: 'z+text',
				zsmooth: (this.smooth_color)?"best":"",
				type: 'heatmap',
				colorscale: 'Jet',
				text: this.text,
				colorbar: {
					thickness: 15,
					xpad: 5
				},
				showscale : true
			};

			if(this.dataTraces.length == 2){
				this.dataTraces.map((obj: any, index: number) => {
					if (obj.opacity == undefined) {
						return Plotly.deleteTraces(this.graphId, index);
					}
				});
			}
			Plotly.addTraces(this.graphId, sliderData);
			Plotly.restyle(this.graphId, 'opacity', 0.6 , [1]);

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

		//share slide to histogramm
		const _cubeToHistoService = this.cubeToHistoService;
		_cubeToHistoService.shareTranche(indexVal);

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

			this.text = lat.map((xi: any, i: number) => long.map((yi: any, j: number) => `
			Long & Lat:<br> (${yi} , ${xi})`));

			const sliderData = 
				{
					z: this.slideData,
					hoverinfo: 'z+text',
					text: this.text,
					zsmooth: (this.smooth_color)?"best":"",
					colorscale: this.colorscale,
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

			//rename legend trace after selected slide
			const graphDiv = <CustomHTMLElement>document.getElementById(this.graphId);
			for(let i=0;i<this.dataTraces.length-1;i++){
				graphDiv.data[i].name = "trace "+(i+1);
			}

			Plotly.redraw(graphDiv);

		});
	}

	/**
	 * Remove a slideID
	 * @function removeSlide
	 * @param {number} slideID
	 */
	removeSlide(slideID : number) {
		this.dataTraces.map((obj: any, index: number) => {
			if(index==slideID){
				Plotly.deleteTraces(this.graphId, index);
			}
		});
	}

	/**
	 * Verify if a slide is drawn
	 * @function isSlideDrawn
	 * @param {number} slideID
	 * @return {boolean} isDrawn
	 */
	isSlideDrawn(slideID : number) {
		let isDrawn : boolean = false;
		this.dataTraces.map((obj: any, index: number) => {
			if(index==slideID){
				isDrawn = true;
			}
		});
		return isDrawn;
	}

	/**
	 * Verify if pixel is selected
	 * @function isSelectedPixel
	 * @param {number} x
	 * @param {number} y
	 */
	isSelectedPixel(x: number, y: number){
		let isSelected: boolean = false;
		this.pixelsSelected.map((obj: any, index: number) => {
			if(obj["lat"]==y && obj["long"]==x){
				isSelected = true
				if(this.translateService.currentLang == 'en-US') {
					this.toastr.success(`Pixel is already selected`, `Success!`);
				} else {
					this.toastr.success(`Le pixel sélectioné est déjà sélectionné`, `Succès!`);
				}
			}
		});
		if(isSelected==false){
			this.pixelsSelected.push({"long":x,"lat":y});
		}
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

		this.text = lat.map((xi: any, i: number) => long.map((yi: any, j: number) => `
			Long & Lat:<br> (${yi} , ${xi})`));

		this.val = this.currentTranche;
		//console.log(this.slideData);
		this.dataTraces = [
			{
				z: this.slideData,
				hoverinfo: 'z+text',
				text: this.text,
				zsmooth: (this.smooth_color)?"best":"",
				type: 'heatmap',
				colorscale: this.colorscale,
				colorbar: {
					thickness: 15,
					xpad: 5
				}
			}
		];
		//TODO SCALE DATACUBE
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

		Plotly.newPlot(this.graphId, data, layout, {responsive: true});
	}

	/**
	 * Mizar setter function (TODO not finished)
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

		//to lasso function
		myPlot.on('plotly_selected', (data: any) => {
			let pn = 0,
				tn = 0;
			for (let i = 0; i < data.lassoPoints.x.length; i++) {
				pn = data.lassoPoints.x[i];
				tn = data.lassoPoints.y[i];
				Plotly.addTraces(myPlot, {y: [tn], x: [pn]});

				//change color legend datacube
				Plotly.restyle(this.graphId, 'marker.color', this.colors[this.dataTraces.length-2], [this.dataTraces.length-1]);

				_cubeToSpectreService.shareCubePointCoord({coordX: Math.round(pn), coordY: Math.round(tn)});
			};
		});

		//to click
		myPlot.on('plotly_click', (data: any) => {
			let pn = 0,
				tn = 0;

			for (let i = 0; i < data.points.length; i++) {
				pn = data.points[i].x;
				tn = data.points[i].y;
			};

			this.isSelectedPixel(pn, tn);
			Plotly.addTraces(myPlot, {y: [tn], x: [pn]});

			//change color legend datacube
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
		this.pixelsSelected = [];
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

	/**
	 * Change the colorscale of datacube
	 * @function changeColor
	 */
	changeColor() {
		const _cubeToHistoService = this.cubeToHistoService;
		_cubeToHistoService.shareColorscale(this.colorscale);
		var data = [{
			z: this.slideData,
			  colorscale: this.colorscale,
			  zsmooth: (this.smooth_color)?"best":"",
			  hoverinfo: 'z+text',
			  type: 'heatmap',
			  text: this.text
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
		Plotly.newPlot(this.graphId, data, layout);
		//allows plot on datacube
		this.selectedCoord();

	}

	/**
	 * Set smooth of datacube
	 * @function setSmooth
	 */
	setSmooth() {
		console.log(this.smooth_color);
		var data = [{
			z: this.slideData,
			colorscale: this.colorscale,
			type: 'heatmap',
			zsmooth: (this.smooth_color)?"best":"",
			hoverinfo: 'z+text',
			text: this.text
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
		Plotly.newPlot(this.graphId, data, layout);
		//allows plot on datacube
		this.selectedCoord();
	}

}
