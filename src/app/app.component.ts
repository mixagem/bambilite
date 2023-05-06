import { Component } from '@angular/core';
import { BambiService } from './services/bambi.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})

export class AppComponent {
	title = 'bambi'

	constructor(
		public bambiService: BambiService) {
	}
}