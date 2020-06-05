import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Logger } from '../../logger.service';
import { I18nService } from '../../i18n.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { SearchFileService } from '../../../shared/services/search-file.service';
import { StreamFitService } from '../../../shared/services/stream-fit.service';
import { environment } from '../../../../environments/environment';

const log = new Logger('Header');

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
	version: string = environment.version;
	author: string = environment.author;
	username = <string>'';
	menuHidden = true;
	searchHidden = true;
	aboutHidden = true;
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
		this.searchFileService.getSearchList()
		.subscribe(data => {
			//get listFiles public and private
			localStorage.setItem("listfilesPublic",data["public_files"]);
			localStorage.setItem("listfilesPrivate",data["private_files"]);
			this.fitsTab = data["public_files"].concat(data["private_files"]);
			log.info(`fitList has uploaded: ${this.fitsTab}`);
		});
	}

	/**
	 * Logout application
	 * @function logout
	 * @returns void 
	 */	
	logout() {
		//remove localstorage
		localStorage.clear();
		this.authenticationService.logout()
		  .subscribe(() => this.router.navigate(['/login'], { skipLocationChange: true }));
	  }

	/**
	 * Display or not menu
	 * @function toggleMenu
	 * @returns void 
	 */	
	toggleMenu() {
		this.menuHidden = !this.menuHidden;
		this.searchHidden = true;
		this.aboutHidden = true;
		this.htmlMenuClass(!this.menuHidden);
		
	}

	/**
	 * Display or not about
	 * @function toggleMenu
	 * @returns void 
	 */	
	toggleAbout() {
		this.aboutHidden = !this.aboutHidden;
		this.searchHidden = true;
		this.menuHidden = true;
		this.htmlMenuClass(!this.aboutHidden);
		
	}
	
	/**
	 * Display or not search
	 * @function toggleMenu
	 * @returns void 
	 */	
	toggleSearch() {
		this.searchHidden = !this.searchHidden;
		this.menuHidden = true;
		this.aboutHidden = true;
		this.htmlMenuClass(!this.searchHidden);
		
	}

	/**
	 * Toggle a class "datacube-menu" to the html element
	 * @function htmlMenuClass
	 * @returns void
	 */
	htmlMenuClass(menu: boolean) {
		if(menu){
			$('html').addClass('datacube-menu');
		}else{
			$('html').removeClass('datacube-menu');
		}
	}

	/**
	 * Get file data choosen by user
	 * @function getFitFile
	 * @returns void 
	 */	
	getFitFile(fitFile: string) {
		this.streamFitService.shareFitFile(fitFile);
		this.searchText = null;
		this.toggleSearch();
	}

	setLanguage(language: string) {
		this.i18nService.language = language;
		this.currentLang = language;
		this.toggleMenu();
	}

	get currentLanguage(): string {
		return this.i18nService.language;
	}

	get listLanguages(): string[] {
		return this.i18nService.supportedLanguages;
	}
}
