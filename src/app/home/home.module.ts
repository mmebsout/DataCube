import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { DataCubeComponent } from './dataCube/dataCube.component';
import { SpectreComponent } from './spectre/spectre.component';
import { HistogrammeComponent } from './histogramme/histogramme.component';
import { DescriptionComponent } from './description/description.component';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { QuoteService } from './quote.service';
import { SlideService } from './dataCube/slide.service';
import { SpectreService } from './spectre/spectre.service';
import { MetadataService } from './description/metadata.service';
import { SliderModule } from 'primeng/components/slider/slider';



@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    NgbModule,
    SharedModule,
    HomeRoutingModule,
    FormsModule,
    SliderModule
  ],
  declarations: [
    HomeComponent,
    DataCubeComponent,
    SpectreComponent,
    HistogrammeComponent,
    DescriptionComponent
  ],
  providers: [
    QuoteService,
    SlideService,
    SpectreService,
    MetadataService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeModule { }
