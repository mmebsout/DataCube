import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class CubeToSpectreService {

	// Observable string sources
	private CubePointCoord = new ReplaySubject<number>(0);
	private ResetGraph = new Subject<boolean>();

	// Observable string streams
	CubePointCoord$ = this.CubePointCoord.asObservable();
	ResetGraph$ = this.ResetGraph.asObservable();

	// Service message commands
	shareCubePointCoord(coord: any) {
		return this.CubePointCoord.next(coord);
	}

	shareResetGraph(reset: boolean) {
		return this.ResetGraph.next(reset);
	}
}
