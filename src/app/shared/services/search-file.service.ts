import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

const routes = `/listFiles`;


@Injectable()
export class SearchFileService {

  constructor(private http: Http, public toastr: ToastsManager) { }

  getSearchList(): Observable<string> {
    return this.http.get(routes, { cache: true })
      .map((res: Response) => res.json())
      .map(body => body.response)
      .catch((error:any) => this.toastr.error(error.json().message, 'Oops!'));
  }
}
