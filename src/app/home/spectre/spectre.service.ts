import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

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
	constructor(private http: Http, public toastr: ToastsManager) {
		
	}

	getSpectre(id:slides, naxis: coords): Observable<string> {
		return this.http.get(routes.spectre(id, naxis), { cache: true })
				.map((res: Response) => res.json())
				.map(body => body.response)
				.catch(() => this.toastr.error('Error, could not load the spectre :-(', 'Oops!'));
	}
}