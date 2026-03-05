import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { OverlayStoreService } from './core/services/overlay-store.service';

function initStore(store: OverlayStoreService) {
  return () => store.initialize(); // returns Promise<void>
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initStore,
      deps: [OverlayStoreService],
      multi: true
    }
  ]
};