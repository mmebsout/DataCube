import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable ,  of } from 'rxjs';
import { Logger} from '@app/core';
import { environment } from '../../../environments/environment';

//const log = new Logger('Authentification');

export interface Credentials {
  // Customize received credentials here
  username: string;
  token: string;
}

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

interface IdentificationResponse {
	"role":string,
	"message":boolean
}

const credentialsKey = 'credentials';

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable()
export class AuthenticationService {

  private _credentials: Credentials | null;

  constructor(private http: HttpClient, private router: Router) {
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    }
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=>resolve(), ms)).then(()=>console.log("fired"));
}


  /**
   * Authenticates the user.
   * @param {LoginContext} context The login parameters.
   * @return {Observable<Credentials>} The user credentials.
   */
  login(context: LoginContext) : any{
    let promise = new Promise((resolve, reject) => {
      let apiURL = environment.serverUrl+'/identification';
      this.http.post(apiURL,{username:context.username,password:context.password})
        .subscribe((idResponse : IdentificationResponse) =>{
           if(idResponse.message == true){
              localStorage.setItem('userNameRole',JSON.stringify(idResponse.role));
              localStorage.setItem('userNameDataCube',context.username);
              this.router.navigate(['/'], { skipLocationChange: true });
              this.setCredentials({
              username: context.username,
              token: '123456'
              }, context.remember);
            }else{
              localStorage.removeItem('userNameDataCube');
            }
           
          }
        );
       
    });
    return (localStorage.getItem('userNameDataCube')==undefined)?'no_auth':localStorage.getItem('userNameDataCube');
  }

  /**
   * Logs out the user and clear credentials.
   * @return {Observable<boolean>} True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.setCredentials();
    return of(true);
  }

  /**
   * Checks is the user is authenticated.
   * @return {boolean} True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  /**
   * Gets the user credentials.
   * @return {Credentials} The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this._credentials;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param {Credentials=} credentials The user credentials.
   * @param {boolean=} remember True to remember credentials across sessions.
   */
  private setCredentials(credentials?: Credentials, remember?: boolean) {
    this._credentials = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(credentialsKey, JSON.stringify(credentials));
    } else {
      sessionStorage.removeItem(credentialsKey);
      localStorage.removeItem(credentialsKey);
    }
  }

}
