import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { SlideService } from '../dataCube/slide.service';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { StreamFitService } from '../../shared/services/stream-fit.service';
import { I18nService } from '../../core/i18n.service';
import { HistogrammeComponent } from './histogramme.component';

describe('HistogrammeComponent', () => {
	let component: HistogrammeComponent;
	let fixture: ComponentFixture<HistogrammeComponent>;

	beforeEach(async(() => {
	TestBed.configureTestingModule({
	  imports: [
		TranslateModule.forRoot(),
		ToastModule.forRoot()
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
  	declarations: [HistogrammeComponent]
	}).compileComponents();
  }));


	beforeEach(() => {
		fixture = TestBed.createComponent(HistogrammeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
