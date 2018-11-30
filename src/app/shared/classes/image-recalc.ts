export class ImageRecalc {

	constructor() {}

	/**
	 * Linear filter image function
	 * @function linear
	 */
	public linear(hmax: any, image: any): void {
		let newImageLinear: any = [];

	 	newImageLinear = image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				return ji = ( ji / 256 ) * hmax;
			});
		});

		return newImageLinear;
	}

	/**
	 * Expo filter image function
	 * @function expo
	 */
	public expo(hmax: any, image: any): void {

	 	let newImageExpo: any = [];

	 	newImageExpo = image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				return ji = Math.sqrt(ji / 10.0) / Math.sqrt(256 / 10.0) * hmax;
			});
		});

		return newImageExpo;
	}

	/**
	 * Sqr filter image function
	 * @function sqr
	 */
	sqr(hmax: any, image: any): void {

		let newImageSqr: any = [];


		newImageSqr = image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				return ji = Math.pow(ji, 2) / Math.pow(256, 2) * hmax;
			});
		});

		return newImageSqr;
	}

	/**
	 * Asin filter image function
	 * @function asin
	 */
	asin(hmax: any, image: any): void {

		let newImageAsin: any = [];


		newImageAsin = image.map((xi: any, i: number) => {
			return xi.map((ji: any) => {
				return ji = Math.log(ji + Math.sqrt(Math.pow(ji, 2) + 1.0 )) /
							Math.log(256 + Math.sqrt( Math.pow(256, 2) + 1.0 )) * hmax;
			});
		});

		return newImageAsin;
	}
}
