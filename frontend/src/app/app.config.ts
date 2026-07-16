import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideKeycloak, includeBearerTokenInterceptor, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, createInterceptorCondition, IncludeBearerTokenCondition } from 'keycloak-angular';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { GeoProvider } from './pages/map/providers/geo-provider';
import { MockGeoService } from './pages/map/providers/mock-geo.service';
import { MapApiProvider } from './pages/map/providers/map-api-provider';
import { RestMapApiService } from './pages/map/providers/rest-map-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        createInterceptorCondition<IncludeBearerTokenCondition>({
          urlPattern: /.*/i,
          bearerPrefix: 'Bearer'
        })
      ]
    },
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark'
        }
      }
    }),
    MessageService,
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: 'en'
    }),
    // SOLID: Provide concrete implementations for abstract interfaces
    { provide: GeoProvider, useClass: MockGeoService },
    { provide: MapApiProvider, useClass: RestMapApiService },
    provideKeycloak({
      config: {
        url: 'http://localhost:8081',
        realm: 'geo-task-realm',
        clientId: 'geo-task-web-client'
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
      }
    })
  ]
};
