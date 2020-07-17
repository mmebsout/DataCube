
import {catchError, map} from 'rxjs/operators';



import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpCachePolicy, cache_key } from '@app/core/http/request-options-args';

const routes = {
  spectre: (s: slides, c: coords) => environment.serverUrl + `/spectrum?entry=${s.id}&metadata=NAXIS.&posX=${c.naxis1}&posY=${c.naxis2}`
};

export interface slides {
	id: string;
}

export interface coords {
  naxis1: any;
  naxis2: any;
}
export interface Spectre {
	"feature":{
		"geometry":{"coordinates":number[],"type":"Point"},
		"type":"Feature",
		"properties":{
			"metadata":[["NAXIS1",string],["NAXIS2",string],["NAXIS3",string]],
			"spectrum":{
				"wavelength":number[], 
				"value":number[]
				},
			"fileType":string
			}
		}
}
interface RawSpectre {
	"response": Spectre
	"status":string
}

@Injectable()
export class SpectreService {
	constructor(private http: HttpClient, public toastr: ToastrService) {
		
	}

	getSpectre(id: slides, naxis: coords): Observable<Spectre> {
		
		let header : HttpHeaders = new HttpHeaders().set(cache_key, HttpCachePolicy.Always);
		return this.http.get<RawSpectre>(routes.spectre(id, naxis), {headers : header}).pipe(
			map(data => data.response),
			catchError((err) => {
				this.toastr.error(err.json().message, 'Oops!');
				return throwError(err);
			}
			)
		);
	}
}