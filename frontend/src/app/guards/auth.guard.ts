import { createAuthGuard } from 'keycloak-angular';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// A functional guard that uses keycloak-angular's createAuthGuard
export const AuthGuard = createAuthGuard<any>(
  async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot, authData: any) => {
    const { authenticated, grantedRoles, keycloak } = authData;

    // Force the user to log in if currently unauthenticated.
    if (!authenticated) {
      await keycloak.login({
        redirectUri: window.location.origin + state.url
      });
      return false;
    }

    // Get the roles required from the route.
    const requiredRoles = route.data['roles'];

    // Allow the user to proceed if no additional roles are required to access the route.
    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true;
    }

    // Allow the user to proceed if all the required roles are present.
    // authData.grantedRoles might have realmRoles and resourceRoles.
    const allRoles = [
      ...(grantedRoles.realmRoles || []),
      ...(grantedRoles.resourceRoles || [])
    ];
    return requiredRoles.every((role) => allRoles.includes(role));
  }
);
