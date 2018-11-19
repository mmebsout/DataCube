import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class CubeToSpectreService {

	// Observable string sources
	private CubePointCoord = new ReplaySubject<number>(0);
	private CubeTrace = new ReplaySubject<number>(0);
	private SpectreTrace = new ReplaySubject<number>(0);
	private ResetGraph = new Subject<boolean>();

	// Observable string streams
	CubePointCoord$ = this.CubePointCoord.asObservable();
	ResetGraph$ = this.ResetGraph.asObservable();
	CubeTrace$ = this.CubeTrace.asObservable();
	SpectreTrace$ = this.SpectreTrace.asObservable();

	// Service message commands
	shareCubePointCoord(coord: any) {
		return this.CubePointCoord.next(coord);
	}

	shareTraceNumber(traceNumber: number) {
		return this.CubeTrace.next(traceNumber);
	}
	shareSpectreTraceNumber(traceNumber: number) {
		return this.SpectreTrace.next(traceNumber);
	}


	shareResetGraph(reset: boolean) {
		return this.ResetGraph.next(reset);
	}
}
