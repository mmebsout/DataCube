import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { LoaderService } from '../loader.service';

import { Logger } from '../logger.service';
import { AuthenticationService } from './authentication.service';

const log = new Logger('AuthenticationGuard');

@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(private router: Router,
              private authenticationService: AuthenticationService, 
              private loaderService: LoaderService) { }

  canActivate(): boolean {
    if (this.loaderService.noLogin || this.authenticationService.isAuthenticated()) {
      
      return true;
    }

    log.debug('Not authenticated, redirecting...');
    this.router.navigate(['/login'], { skipLocationChange: true });
    return false;
  }

}
