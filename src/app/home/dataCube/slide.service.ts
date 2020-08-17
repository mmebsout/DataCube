
import {map, catchError} from 'rxjs/operators';



import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { HttpCachePolicy, cache_key } from '@app/core/http/request-options-args';



const routes = {
  slide: (s: slides) => environment.serverUrl + `/slide?entry=${s.id}&posZ=0`,
  tranche: (s: slides, t: tranches) => environment.serverUrl + `/slide?entry=${s.id}&posZ=${t.idTranche}`
};

export interface slides {
	id: string;
}

export interface tranches {
  idTranche: number;
}

export interface Slide {
	"feature":{
		"geometry":{"coordinates":[number,number],"type":"Point"},
		"type":"Feature",
		"properties":{
			"metadata":[],
			"slide":{ "value":number[][]},
			"fileType":string
			}
		}
	}

export interface RawSlide {
	"response":Slide,
	"status":"OK"
}

@Injectable()
export class SlideService {

	constructor(private http: HttpClient, public toastr: ToastrService) {
	}

	getSlide(id: slides): Observable<Slide>  {
		let header : HttpHeaders = new HttpHeaders().set(cache_key, HttpCachePolicy.Never);
		return this.http.get<RawSlide>(routes.slide(id), {headers : header})
			.pipe(
				map(body => body.response),
				catchError((err:any) => {
					this.toastr.error(err.json().message, 'Oops!');
					return throwError(err);
				}
			),
		);
	}

	getNextTranche(id: slides, idTranche: tranches): Observable<Slide> {
		let header : HttpHeaders = new HttpHeaders().set(cache_key, HttpCachePolicy.Never);
		return this.http.get<RawSlide>(routes.tranche(id, idTranche), {headers : header})
			.pipe(
				map(body => body.response),
				catchError(
					(err: any) => {
						this.toastr.error(err.json().message, 'Oops!');
						return throwError(err);
					}
				),
			);
	}
}
