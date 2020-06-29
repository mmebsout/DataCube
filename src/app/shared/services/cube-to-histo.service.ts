import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class CubeToHistoService {

	// Observable string sources
	private Colorscale = new ReplaySubject<string>();

	private tranche = new ReplaySubject<number>();

	// Observable string streams
	Colorscale$ = this.Colorscale.asObservable();
	tranche$ = this.tranche.asObservable();

	// Service message commands
	shareColorscale(colorscale: string) {
		return this.Colorscale.next(colorscale);
	}

	shareTranche(tranche: number) {
		return this.tranche.next(tranche);
	}
}
