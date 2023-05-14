import { Injectable } from '@angular/core';
import { IMaterialsRecipe } from 'src/app/interfaces/Fd';

@Injectable({
	providedIn: 'root'
})
export class RecipeMaterialDetailsService {

	// current previewd product
	recordDetails: IMaterialsRecipe = { stamp: '', origin: '', originstamp: '', recipestamp: '', title: '', kcal: 0, unit: '', unitvalue: 0, price: 0, owner: '', qtd: 1 }

	constructor() { }
}
