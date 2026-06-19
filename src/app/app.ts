import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocationPickerComponent } from './components/layout/location-picker.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LocationPickerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
