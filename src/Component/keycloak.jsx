import { environment } from "../constants/environment";
import Keycloak from "keycloak-js";

export default class KeycloakService {
  static auth = null;

  static init() {
    const keycloakAuth = new Keycloak({
      url: environment.keycloakRootUrl,
      realm: 'master',
      clientId: 'maatrum',
    });

    KeycloakService.auth = { loggedIn: false };

    return new Promise((resolve, reject) => {
      console.log("Keycloak configuration:", keycloakAuth);
      keycloakAuth.init({ onLoad: 'login-required', checkLoginIframe: false, flow: 'standard' })
        .then(authenticated => {
          if (authenticated) {
            sessionStorage.setItem('token', JSON.stringify(keycloakAuth.token));
            KeycloakService.auth.loggedIn = true;
            KeycloakService.auth.authz = keycloakAuth;
            KeycloakService.auth.logoutUrl = `${keycloakAuth.authServerUrl}realms/master/protocol/openid-connect/logout?post_logout_redirect_uri=${document.baseURI}&id_token_hint=${keycloakAuth.idToken}`;
          }
          resolve(authenticated);
        })
        .catch(error => {
          console.error("Failed to initialize Keycloak:", error);
          reject(error);
        });
    });
  }

  static logout() {
    if (KeycloakService.auth) {
      KeycloakService.auth.loggedIn = false;
      KeycloakService.auth.authz = null;
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = KeycloakService.auth.logoutUrl;
    } else {
      console.error("Keycloak authentication object not initialized.");
    }
  }

  static getUsername() {
    return KeycloakService.auth?.authz?.tokenParsed?.preferred_username || null;
  }

  static getFullName() {
    return KeycloakService.auth?.authz?.tokenParsed?.name || null;
  }

  static getToken() {
    if (KeycloakService.auth?.authz?.token) {
      return KeycloakService.auth.authz.updateToken(5)
        .then(() => KeycloakService.auth.authz.token)
        .catch(error => {
          console.error("Failed to refresh token:", error);
          throw new Error("Failed to refresh token");
        });
    } else {
      console.error("Not logged in");
      throw new Error("Not logged in");
    }
  }
}
