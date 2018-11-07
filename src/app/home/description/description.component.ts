import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { I18nService } from '../../core/i18n.service';
import {NgbAccordionConfig} from '@ng-bootstrap/ng-bootstrap';
import { MetadataService } from './metadata.service';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { Fit } from '../../shared/classes/fit';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
  providers: [NgbAccordionConfig]
})
export class DescriptionComponent implements OnInit {
	@Output()
	descLoadingStatus: EventEmitter<boolean> = new EventEmitter<boolean>(); 

	objectKeys = Object.keys;
	isLoadingDesc = <boolean>true;
	currentSlide: any = new Fit(null);
	metadatas: any = [];

	localisation = {
		name: 'm31',
		constellation: 'andromeda'
	};

	type = {
		class: 'star'
	};

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
		private metadataService: MetadataService) {

		config.closeOthers = true;
		config.type = 'info';

		streamFitService.FitFile$.subscribe(fit => {
			console.log('reception Fit', fit);
			this.currentSlide = new Fit(fit);
			this.ngOnInit();
		});
	}

	/**
	 * Description Init Function
	 */
	ngOnInit() {
		this.metadataService
			.getMetadata({id: this.currentSlide.name})
			.finally(() => { this.descLoadingStatus.emit(false); })
			.subscribe((metadata: any) => {
				console.log('metadata', metadata);
				this.metadatas = metadata.feature.properties.metadata;
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
