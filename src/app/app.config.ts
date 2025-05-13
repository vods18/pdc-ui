import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';  // Certifique-se de importar o MatListModule
import { FormsModule } from '@angular/forms';  // Certifique-se de importar o FormsModule

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(
      MatIconModule,
      MatButtonModule,
      MatListModule,  // Importação do MatListModule para usar o mat-selection-list
      FormsModule     // Importação do FormsModule para usar ngModel
    ),
  ]
};
