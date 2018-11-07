import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { CubeToSpectreService } from '../../shared/services/cube-to-spectre.service';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { SpectreComponent } from './spectre.component';
import { SpectreService } from './spectre.service';
import { I18nService } from '../../core/i18n.service';

describe('SpectreComponent', () => {
	let component: SpectreComponent;
	let fixture: ComponentFixture<SpectreComponent>;

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
			CubeToSpectreService,
			StreamFitService,
			SpectreService
		],
		declarations: [SpectreComponent]
    }).compileComponents();
  }));

	beforeEach(() => {
		fixture = TestBed.createComponent(SpectreComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});	
});