import { forwardRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader/loader.component';
import { AccordionDirective } from './directives/accordion.directive';
import { CubeToSpectreService } from './services/cube-to-spectre.service';
import { SearchFileService } from './services/search-file.service';
import { StreamFitService } from './services/stream-fit.service';


@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		LoaderComponent,
		AccordionDirective
	],
	exports: [
		LoaderComponent,
		AccordionDirective
	],
	providers: [
		CubeToSpectreService,
		SearchFileService,
		StreamFitService
	]
})
export class SharedModule {}
