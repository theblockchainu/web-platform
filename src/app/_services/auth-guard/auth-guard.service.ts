import { Injectable } from '@angular/core';
import {
	CanActivate, Router,
	CanActivateChild,
	CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot
} from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild, CanLoad {

	constructor(private authService: AuthenticationService, private router: Router,
		public _cookieService: CookieUtilsService) { }

	canActivate(route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): boolean {
		if (!this._cookieService.isBrowser) {
			return true;
		} else if (!this._cookieService.getValue('userId')) {
			this.router.navigate(['login']);
			return false;
		} else {
			return true;
		}
	}

	canActivateChild(route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): boolean {
		return this.canActivate(route, state);
	}

	canLoad(): boolean {
		if (!this._cookieService.isBrowser) {
			return true;
		} else if (!this._cookieService.getValue('userId')) {
			this.router.navigate(['login']);
			return false;
		} else {
			return true;
		}
	}

}
