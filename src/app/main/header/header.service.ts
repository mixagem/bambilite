import { Injectable } from '@angular/core';

type HeaderRoute = '' | 'dashboard' | 'products'


@Injectable({
	providedIn: 'root'
})

export class HeaderService {

	currentRoute: HeaderRoute = '';

	constructor(){
	}

}
