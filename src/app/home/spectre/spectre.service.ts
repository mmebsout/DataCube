
import {catchError, map} from 'rxjs/operators';



import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

const routes = {
  spectre: (s: slides, c: coords) => `/spectrum?entry=${s.id}&metadata=NAXIS.&posX=${c.naxis1}&posY=${c.naxis2}`
};

export interface slides {
	id: string;
}

export interface coords {
  naxis1: any;
  naxis2: any;
}

@Injectable()
export class SpectreService {
	constructor(private http: Http, public toastr: ToastrService) {
		
	}

	getSpectre(id:slides, naxis: coords): Observable<string> {
		return this.http.get(routes.spectre(id, naxis), { cache: true }).pipe(
				map((res: Response) => res.json()),
				map(body => body.response),
				catchError((err) => {
					this.toastr.error(err.json().message, 'Oops!');
					return throwError(err);
				}
			)
		);
	}
}