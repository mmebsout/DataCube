
import {of as observableOf,  Observable, throwError } from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { cache_key, HttpCachePolicy } from '@app/core/http/request-options-args';

const routes = {
  metadata: (s: Slides) => environment.serverUrl + `/header?entry=${s.id}`,
  dimension: (s: Slides) => environment.serverUrl + `/header?entry=${s.id}&metadata=empty`
};

export interface Slides {
	id: string;
}

export interface Metadata {
	"feature":
	{
		"geometry":{"coordinates":[0,0],"type":"Point"},
		"type":"Feature",
		"properties":{
			"metadata":[string, string, string][] | [[string, string, string]] | [], 
			"fileType":string,
			"dimensions":{
				"typeVal":string, 
				"typeY":string,
				"stepZ":number,
				"typeX":string,
				"stepX":number,
				"stepY":number,
				"refLat":string, //TODO should be number
				"unitX":string,
				"refX":string, //TODO should be number
				"unitY":string,
				"unitZ":string,
				"refZ":string, //TODO should be number
				"refY":string, // TODO should be number
				"unitVal":string,
				"refLevel":string, //TODO should be number
				"typeZ":string,
				"dimZ":number,
				"dimY":number,
				"dimX":number,
				"refLon": string //TODO should be number
			}
		}
	}
}
interface RawMetadata {
		"response": Metadata,
		"status": string
	}

@Injectable()
export class MetadataService {
	constructor(private http: HttpClient, public toastr: ToastrService) {
	}

	getMetadata(id: Slides): Observable<Metadata> {
		let header : HttpHeaders = new HttpHeaders().set(cache_key, HttpCachePolicy.Always);
		return this.http.get<RawMetadata>(routes.metadata(id), {headers : header}).pipe(
			map(body => body.response),
			catchError((err) => {
				this.toastr.error(err.json().message, 'Oops!');
				return throwError(err);
			}
			)
		);
	}

	getDimension(id: Slides): Observable<Metadata> {
		let header : HttpHeaders = new HttpHeaders().set(cache_key, HttpCachePolicy.Always);
		return this.http.get<RawMetadata>(routes.dimension(id), {headers : header}).pipe(
				map(body => body.response),
				catchError((err) => {
					this.toastr.error(err.json().message, 'Oops!');
					return throwError(err);
				}));
	}
}
