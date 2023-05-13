import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from '../services/app.service';

@Pipe({
	name: 'translation',
	pure: false
})
export class TranslationPipe implements PipeTransform {

	constructor(private _appService: AppService){}

	transform(localeID: string) : string {
		return !!this._appService.LOCALES[`${localeID}`] ? this._appService.LOCALES[`${localeID}`] : localeID
	}

}
