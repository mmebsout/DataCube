import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';

import { environment } from '../environments/environment';
import { Logger } from './core/logger.service';
import { LoaderService } from './core/loader.service';
import { I18nService } from './core/i18n.service';


const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  attrAppDataCube: boolean;
  attrAppSpectre: boolean;
  attrAppHistogramm: boolean;
  attrAppDescription: boolean;
  attrFile: string;
  attrDataPath: string;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private titleService: Title,
              private translateService: TranslateService,
              private i18nService: I18nService,
              private loader: LoaderService,
              private elRef: ElementRef) {
                    //init each object with the correct value (displayed or not)
                    this.attrAppDataCube = (this.elRef.nativeElement.getAttribute('appDataCube')!=null)?this.toBoolean(this.elRef.nativeElement.getAttribute('appDataCube')):true,
                    this.attrAppSpectre = (this.elRef.nativeElement.getAttribute('appSpectre')!=null)?this.toBoolean(this.elRef.nativeElement.getAttribute('appSpectre')):true,
                    this.attrAppHistogramm = (this.elRef.nativeElement.getAttribute('appHistogramm')!=null)?this.toBoolean(this.elRef.nativeElement.getAttribute('appHistogramm')):true,
                    this.attrAppDescription = (this.elRef.nativeElement.getAttribute('appDescription')!=null)?this.toBoolean(this.elRef.nativeElement.getAttribute('appDescription')):true;
                    this.attrFile = (this.elRef.nativeElement.getAttribute('appFile')!=null)?this.elRef.nativeElement.getAttribute('appFile'):null;
              }

              toBoolean(xxx: any): boolean {
                if(xxx) {
                  const xStr = xxx.toString().toLowerCase().trim();
                  if(xStr === 'true' || xStr === 'false') {
                    return xStr === 'true' ? true : false;
                  } else {
                    return xxx ? true : false;
                  }
                } else {
                  return false;
                }
              }

  ngOnInit() {
    // Setup logger
    if (environment.production) {
      log.debug('Production mode');
      Logger.enableProductionMode();
    }

    log.debug('init');
    log.debug('attrAppDataCube : ', this.attrAppDataCube);
    log.debug('attrAppSpectre : ', this.attrAppSpectre);
    log.debug('attrAppHistogramm : ', this.attrAppHistogramm);
    log.debug('attrAppDescription : ', this.attrAppDescription);
    log.debug('attrDataPath : ', this.attrDataPath);
    log.debug('attrFile : ', this.attrFile);

    //init loader with good values (loader service share values into component)
    this.loader.init(this.attrAppDataCube, this.attrAppSpectre, this.attrAppHistogramm, this.attrAppDescription, this.attrDataPath, this.attrFile);

    // Setup translations
    this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);

    const onNavigationEnd = this.router.events.filter(event => event instanceof NavigationEnd);

    // Change page title on navigation or language change, based on route data
    Observable.merge(this.translateService.onLangChange, onNavigationEnd)
      .map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .mergeMap(route => route.data)
      .subscribe(event => {
        const title = event['title'];
        if (title) {
          this.titleService.setTitle(this.translateService.instant(title));
        }
      });
  }

}
