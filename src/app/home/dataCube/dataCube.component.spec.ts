import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { SliderModule } from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { I18nService } from '../../core/i18n.service';
import { MetadataService } from '../description/metadata.service';
import { SlideService } from './slide.service';
import { DataCubeComponent } from './dataCube.component';

describe('DataCubeComponent', () => {
	let component: DataCubeComponent;
	let fixture: ComponentFixture<DataCubeComponent>;

	beforeEach(async(() => {
	//Stub the SlideService
	let slideServiceStub = {
		name: '1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits'
	};

    TestBed.configureTestingModule({
        imports: [
          FormsModule,
          SharedModule,
          BrowserAnimationsModule,
          SliderModule,
          TranslateModule.forRoot(),
          ToastrModule.forRoot()
        ],
        declarations: [DataCubeComponent],
        providers: [
          MockBackend,
          BaseRequestOptions,
          {
            provide: Http,
            useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
              return new Http(backend, defaultOptions);
            },
            deps: [MockBackend, BaseRequestOptions]
          }, 
          SlideService,
          I18nService,
          MetadataService
        ]
      })
      .compileComponents();
  }));


	beforeEach(() => {
		fixture = TestBed.createComponent(DataCubeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});	
});