
import { NgModule } from '@angular/core';
import { TranslationPipe } from '../pipes/translation.pipe';

@NgModule({

	declarations: [
		TranslationPipe
	],
	imports: [
	],
	exports: [TranslationPipe],

})
export class PipesModule { }