
import {catchError, map} from 'rxjs/operators';



import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { cache_key, HttpCachePolicy } from '@app/core/http/request-options-args';

const routes = environment.serverUrl+`/listFiles`;

interface Files {
	"private_files": string[],
	"public_files": string[],
	"status":"OK"
}

@Injectable()
export class SearchFileService {

  constructor(private http: HttpClient, public toastr: ToastrService) { }

  getSearchList(): Observable<Files> {
    let header : HttpHeaders = new HttpHeaders().set(cache_key, HttpCachePolicy.Never);
    return this.http.get<Files>(routes, {headers : header}).pipe(
      catchError(err => {
        this.toastr.error(err.json().message, 'Oops!');
        return throwError(err);
    }));
  }
}
