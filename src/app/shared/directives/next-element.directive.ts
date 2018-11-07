import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
	selector: '[appNextElement]',
})
export class NextElementDirective {
	private el: ElementRef;

	constructor(private _el: ElementRef) {
		this.el = this._el;
	}

	@HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {
		const listElement = $(this.el.nativeElement);
		if ( e.keyCode === 9 ) {
			e.preventDefault();
			listElement.removeClass('active');
			listElement.next().children().first().focus().addClass('active');
		}
	}
}
