import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

const routes = {
  metadata: (s: Slides) => `/header?entry=${s.id}`,
  dimension: (s: Slides) => `/header?entry=${s.id}&metadata=empty`
};

export interface Slides {
  id: string;
}


@Injectable()
export class MetadataService {
	constructor(private http: Http) {
	}

	getMetadata(id: Slides): Observable<string> {
		return this.http.get(routes.metadata(id), { cache: false })
				.map((res: Response) => res.json())
				.map(body => body.response)
				.catch(() => Observable.of('Error, could not load the Metadata :-('));
	}

	getDimension(id: Slides): Observable<string> {
		return this.http.get(routes.dimension(id), { cache: true })
				.map((res: Response) => res.json())
				.map(body => body.response)
				.catch(() => Observable.of('Error, could not load the Dimension :-('));
	}
}
