
import {catchError, map} from 'rxjs/operators';



import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

const routes = `/listFiles`;


@Injectable()
export class SearchFileService {

  constructor(private http: Http, public toastr: ToastrService) { }

  getSearchList(): Observable<string> {
    return this.http.get(routes, { cache: true }).pipe(
      map((res: Response) => res.json()),
      map(body => body),
      catchError(err => {
        this.toastr.error(err.json().message, 'Oops!');
        return throwError(err);
    }));
  }
}
