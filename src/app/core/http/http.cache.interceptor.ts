
import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpResponse, HttpInterceptor, HttpHandler } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import 'rxjs/add/observable/of';
import { HttpCacheService } from './http-cache.service';
import { HttpCachePolicy , cache_key} from './request-options-args';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  constructor(private cache: HttpCacheService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
      let caching : string = null;
      caching = req.headers.has(cache_key) ? req.headers.get(cache_key) : null;
      req = req.clone({headers : req.headers.delete(cache_key)});
    if(!caching ||  caching === HttpCachePolicy.Never) {
        // Do not use cache
        return next.handle(req);
    } else if (caching === HttpCachePolicy.Update){
        // Override cache
        this.sendRequest(req, next, this.cache);
    }else if (caching === HttpCachePolicy.Always){
        // Store new response in cache
        const cachedResponse = this.cache.getCacheData(req.urlWithParams);
        return cachedResponse ? Observable.of(cachedResponse) : this.sendRequest(req, next, this.cache);
    }else{
        throw new Error(`Unknown HttpCachePolicy "${caching}"`);
    }
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler,
    cache: HttpCacheService): Observable<HttpEvent<any>> {
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          cache.setCacheData(req.urlWithParams, event);
        }
      })
    );
  }
}
