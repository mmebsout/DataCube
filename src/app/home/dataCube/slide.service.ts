import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

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

	constructor(private http: Http, public toastr: ToastsManager) {
	}

	getSlide(id: slides): Observable<string>  {
		return this.http.get(routes.slide(id), { cache: false })
				.map((res: Response) => res.json())
				.map(body => body.response)
				.catch(() => this.toastr.error('Error, could not load the slide :-(', 'Oops!'));
	}

	getNextTranche(id: slides, idTranche: tranches): Observable<string> {
		return this.http.get(routes.tranche(id, idTranche), {cache: false})
						.map((res: Response) => res.json())
						.map(body => body.response)
						.catch(() => this.toastr.error('Error, could not load this specific slide :-(', 'Oops!'));
	}
}
