import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { I18nService } from '../../core/i18n.service';
import {NgbAccordionConfig} from '@ng-bootstrap/ng-bootstrap';
import { MetadataService } from './metadata.service';
import { LoaderService } from '../../core/loader.service';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { Fit } from '../../shared/classes/fit';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
  providers: [NgbAccordionConfig]
})
export class DescriptionComponent implements OnInit {
	@Output()
	descLoadingStatus: EventEmitter<boolean> = new EventEmitter<boolean>(); 

	mustBeLoaded : boolean;
	objectKeys = Object.keys;
	isLoadingDesc = <boolean>true;
	currentSlide: any = new Fit(null);
	metadatas: any = [];
	localisation: any = {};
	object_type: any = {};
	pathData: string = null;

	/**
	 * Constructor of description component
	 * @constructor
	 * @param {I18nService} i18nService - Translate service provider
	 * @param {NgbAccordionConfig} config - Directive accordion
	 * @param {StreamFitService} streamFitService - Fit file getter service provider
	 * @param {MetadataService} metadataService - Metadat getter service provider
	 */
	constructor (
		private i18nService: I18nService,
		config: NgbAccordionConfig,
		private streamFitService: StreamFitService,
		private loaderService: LoaderService,
		private metadataService: MetadataService,
		public toastr: ToastsManager) {
		this.mustBeLoaded = this.loaderService.description;	
		config.closeOthers = true;
		config.type = 'info';

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

	/**
	 * Description Init Function
	 */
	ngOnInit() {
		this.metadataService
			.getMetadata({id: this.currentSlide.name, path : this.pathData})
			.finally(() => { this.descLoadingStatus.emit(false); })
			.subscribe((metadata: any) => {
				if(metadata instanceof Object) {
					this.metadatas = metadata.feature.properties.metadata;
					this.localisation = metadata.feature.properties.localisation;
					this.object_type = metadata.feature.properties.object_type;
				}				
				else {
					this.toastr.error(metadata, 'Oops!')
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
