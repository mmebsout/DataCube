import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ShellComponent } from './shell.component';
import { SearchFileService } from '../../shared/services/search-file.service';
import { StreamFitService } from '../../shared/services/stream-fit.service';
import { CoreModule } from '../core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async(() => {
    let searchFileStub = {
      list: [
        "1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits",
        "1342251326_1342214827_NGC6334I_on_SSW_apodized_supreme_cube.fits",
        "Ced201-2_1342225578_L2_blue_63.18_OI_EquidistantInterpolatedCube.fits"
      ]
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        NgbModule.forRoot(),
        CoreModule
      ],
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
        StreamFitService,
        SearchFileService
       
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
