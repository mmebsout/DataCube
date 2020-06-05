import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, Location } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import { LoginModule } from './login/login.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './home/home.module';

@NgModule({
  imports: [
	BrowserModule,
	FormsModule,
	HttpModule,
	TranslateModule.forRoot(),
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
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
