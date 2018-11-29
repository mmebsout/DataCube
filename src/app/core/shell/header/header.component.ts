import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Logger } from '../../logger.service';
import { I18nService } from '../../i18n.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { SearchFileService } from '../../../shared/services/search-file.service';
import { StreamFitService } from '../../../shared/services/stream-fit.service';
import { Fit } from '../../../shared/classes/fit';
import { environment } from '../../../../environments/environment';

const log = new Logger('searchFileService');

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
	username = <string>'';
	menuHidden = true;
	searchHidden = true;
	searchText = <any>null;
	fitsTab = <any>[];
	languages = <any>[];
	fitFile = <string>'';
	currentLang = <string>'';
	imgPath = <string>'';

	constructor(private router: Router,
				private i18nService: I18nService,
				private searchFileService: SearchFileService,
				private authenticationService: AuthenticationService,
				private streamFitService: StreamFitService) { }

	ngOnInit() {
		this.imgPath = environment.imgPath;
		this.username = localStorage.getItem('userNameDataCube');
		this.languages = this.listLanguages;
		this.currentLang = this.currentLanguage;
		console.log(this.currentLang);
		this.searchFileService.getSearchList()
		.subscribe(data => {
			this.fitsTab = data;
			log.info(`fitList has uploaded: ${this.fitsTab}`);
		});
	}

	logout() {
		localStorage.clear();
		this.authenticationService.logout()
		  .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
	  }

	toggleMenu() {
		this.menuHidden = !this.menuHidden;
		this.searchHidden = true;
		$('html').toggleClass('menu');
	}

	toggleSearch() {
		this.searchHidden = !this.searchHidden;
		this.menuHidden = true;
		$('html').removeClass('menu');
	}

	getFitFile(fitFile: string) {
		this.streamFitService.shareFitFile(fitFile);
		this.searchText = null;
		this.toggleSearch();
	}

	setLanguage(language: string) {
		this.i18nService.language = language;
		this.currentLang = language;
	}

	get currentLanguage(): string {
		return this.i18nService.language;
	}

	get listLanguages(): string[] {
		return this.i18nService.supportedLanguages;
	}
}
