import {Directive, ElementRef, HostListener} from '@angular/core';
import * as $ from 'jquery';

@Directive({
	selector: '[accordion]',
})
export class AccordionDirective {
	constructor (public el: ElementRef) { }

	ngOnInit () {
		$(this.el.nativeElement).next('div').css('display', 'none');
	}

	@HostListener ('click') onclick () {
		this.togglePane();
	}

	private togglePane () {
		$(event.target).toggleClass('active').next('div').slideToggle();
	}
}
