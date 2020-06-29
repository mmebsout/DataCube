import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { SlideService } from '../dataCube/slide.service';
import { ToastrModule } from 'ngx-toastr';

import { StreamFitService } from '../../shared/services/stream-fit.service';
import { I18nService } from '../../core/i18n.service';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
	let component: HistogramComponent;
	let fixture: ComponentFixture<HistogramComponent>;

	beforeEach(async(() => {
	TestBed.configureTestingModule({
	  imports: [
		TranslateModule.forRoot(),
		ToastrModule.forRoot()
	  ],
	  providers: [
	  	I18nService,
	  	BaseRequestOptions,
	  	MockBackend,
	  	{
			provide: Http,
			useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
			  return new Http(backend, defaultOptions);
			},
			deps: [MockBackend, BaseRequestOptions]
		},
	  	SlideService,
		StreamFitService
	  ],
  	declarations: [HistogramComponent]
	}).compileComponents();
  }));


	beforeEach(() => {
		fixture = TestBed.createComponent(HistogramComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
