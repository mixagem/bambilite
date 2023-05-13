import { Component } from '@angular/core';
import { AppService } from './services/app.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})

export class AppComponent {
	title = 'myapp';

	constructor(
		private _appService: AppService) { };

	appService(property: string): any { return this._appService[`${property}` as keyof typeof this._appService] };
};