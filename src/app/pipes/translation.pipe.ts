import { Pipe, PipeTransform } from '@angular/core';
import { BambiService } from '../services/bambi.service';

@Pipe({
	name: 'translation',
	pure: false
})
export class TranslationPipe implements PipeTransform {

	constructor(private _bambiService: BambiService){}

	transform(localeID: string) : string {
		return this._bambiService.LOCALES[`${localeID}`]
	}

}
