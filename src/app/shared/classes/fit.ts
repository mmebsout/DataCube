import { StreamFitService } from '../services/stream-fit.service';

export class Fit {
	public name = <string>'1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits';

	constructor( public fitFile: string ) {
		this.name = fitFile || '1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits';
	}
}
