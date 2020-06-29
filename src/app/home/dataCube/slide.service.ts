
import {map, catchError} from 'rxjs/operators';



import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';


const routes = {
  slide: (s: slides) => `/slide?entry=${s.id}&posZ=0`,
  tranche: (s: slides, t: tranches) => `/slide?entry=${s.id}&posZ=${t.idTranche}`
};

export interface slides {
	id: string;
}

export interface tranches {
  idTranche: number;
}

@Injectable()
export class SlideService {

	constructor(private http: Http, public toastr: ToastrService) {
	}

	getSlide(id: slides): Observable<string>  {
		return this.http.get(routes.slide(id), { cache: false })
			.pipe(
				map((res: Response) => res.json()),
				map(body => body.response),
				catchError((err:any) => {
					this.toastr.error(err.json().message, 'Oops!');
					return throwError(err);
				}
			),
		);
	}

	getNextTranche(id: slides, idTranche: tranches): Observable<string> {
		return this.http.get(routes.tranche(id, idTranche), { cache: false })
			.pipe(
				map((res: Response) => res.json()),
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
