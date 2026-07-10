import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsStateService {
  readonly mobileSettingsStep = signal<'menu' | 'profile' | 'security' | 'notifications' | 'platform'>('menu');
}
