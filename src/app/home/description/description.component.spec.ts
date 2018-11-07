import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';


import { I18nService } from '../../core/i18n.service';
import { MetadataService } from './metadata.service';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { DescriptionComponent } from './description.component';

describe('DescriptionComponent', () => {
	let component: DescriptionComponent;
	let fixture: ComponentFixture<DescriptionComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
		  imports: [TranslateModule.forRoot()],
	      declarations: [DescriptionComponent],
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
	      	I18nService, 
	      	MetadataService, 
	      	StreamFitService
	      ]
	    });
		fixture = TestBed.createComponent(DescriptionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});	
});