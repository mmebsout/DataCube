import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataCubeComponent } from '../../home/dataCube/dataCube.component';

const routes = `http://localhost/api/rest`;

@Injectable()
export class DataService {

    private actionUrl: string;
    private dataCube: DataCubeComponent;

    constructor(private http: HttpClient, cube : DataCubeComponent) {
        this.dataCube = cube;
    }

    public isSlideDrawn<T>(id : number): boolean {
        let isSlideDrawn : boolean = false;
        this.http.get(routes + '/isSlideDrawn/${id}').subscribe((res : any)=>{
            isSlideDrawn =this.dataCube.isSlideDrawn(id);
        },
        error => {
          console.log(error, "error");
        });
        return isSlideDrawn;
    }
}


@Injectable()
export class CustomInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!req.headers.has('Content-Type')) {
            req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
        }

        req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
        return next.handle(req);
    }
}