import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
	selector: '[appChooseElement]',
})
export class ChooseElementDirective {
	private el: ElementRef;

	constructor(private _el: ElementRef) {
		this.el = this._el;
	}

	@HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {
		const listElement = $(this.el.nativeElement);

		if ( e.keyCode === 40 ) {
			e.preventDefault();
			console.log('this.el.nativeElement ==>', this.el.nativeElement);
			listElement.removeClass('active');
			listElement.next().focus().addClass('active');
		}

		if ( e.keyCode === 38 ) {
			e.preventDefault();
			listElement.removeClass('active');
			listElement.prev().focus().addClass('active');
		}

		if ( e.keyCode === 13 ) {
			e.preventDefault();
			console.log('el ==>', this.el);
			listElement.removeClass('active');
			listElement.click();
		}
	}
}
