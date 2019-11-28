import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { SliderModule } from 'primeng/primeng';

import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './home.component';
import { QuoteService } from './quote.service';
import { DataCubeComponent } from './dataCube/dataCube.component';
import { DescriptionComponent } from './description/description.component';
import { HistogramComponent } from './histogram/histogram.component';
import { SpectreComponent } from './spectre/spectre.component';
import { I18nService } from '../core/i18n.service';
import { SlideService } from './dataCube/slide.service';
import { MetadataService } from './description/metadata.service';
import { SpectreService } from './spectre/spectre.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          SharedModule,
          SliderModule,
          BrowserAnimationsModule,
          FormsModule,
          TranslateModule.forRoot(),
          ToastModule.forRoot()
        ],
        declarations: [
          HomeComponent,
          DataCubeComponent,
          DescriptionComponent,
          HistogramComponent,
          SpectreComponent
          ],
        providers: [
          QuoteService,
          MockBackend,
          BaseRequestOptions,
          {
            provide: Http,
            useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
              return new Http(backend, defaultOptions);
            },
            deps: [MockBackend, BaseRequestOptions]
          },
          I18nService,
          SlideService,
          MetadataService,
          SpectreService
        ]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
