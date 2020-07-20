import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, Location } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule , HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import { LoginModule } from './login/login.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './home/home.module';
import { HttpCacheService, Logger } from './core';
import { CachingInterceptor } from './core/http/http.cache.interceptor';
// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

const log = new Logger('AppModule');

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}
@NgModule({
  imports: [
	BrowserModule,
	FormsModule,
	HttpClientModule,
	TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
	NgbModule.forRoot(),
	CoreModule,
	SharedModule,
	HomeModule,
	LoginModule,
	AppRoutingModule,
	BrowserAnimationsModule
  ],
  declarations: [AppComponent],
  providers: [
	{ provide: APP_BASE_HREF, useValue: window['_app_base'] || '/DataCube/' },
	HttpCacheService,
	{provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi:true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
