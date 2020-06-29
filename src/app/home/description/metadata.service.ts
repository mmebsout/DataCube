
import {of as observableOf,  Observable } from 'rxjs';

import {map, catchError} from 'rxjs/operators';




import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

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
		return this.http.get(routes.metadata(id), { cache: false }).pipe(
				map((res: Response) => res.json()),
				map(body => body.response),
				catchError(() => observableOf('Error, could not load the Metadata :-(')),);
	}

	getDimension(id: Slides): Observable<string> {
		return this.http.get(routes.dimension(id), { cache: true }).pipe(
				map((res: Response) => res.json()),
				map(body => body.response),
				catchError(() => observableOf('Error, could not load the Dimension :-(')),);
	}
}
