import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';

 
@Injectable()
export class StreamFitService {

	// Observable string sources
	private FitFile = new Subject<string>();

	// Observable string streams
	FitFile$ = this.FitFile.asObservable();

	// Service message commands
	shareFitFile(fit: string) {
		return this.FitFile.next(fit);
	}
}