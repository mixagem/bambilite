import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/main/mainforms/fd/products/products.service';
import { RecipesService } from 'src/app/main/mainforms/fd/recipes/recipes.service';
import { SupplementsService } from 'src/app/main/mainforms/sp/supplements/supplements.service';
import { AppService } from 'src/app/services/app.service';

@Component({
	selector: 'bl-delete-confirmation-dialog',
	templateUrl: './delete-confirmation-dialog.component.html',
	styleUrls: ['./delete-confirmation-dialog.component.scss']
})

export class DeleteConfirmationDialogComponent {

	constructor(
		private _appService: AppService,
		private _productsService: ProductsService,
		private _recipesService: RecipesService,
		private _supplementsService: SupplementsService,
		private _router: Router) {
	};

	confirmDelete(): void {
		switch (this._router.url) {
			case '/fd/products':
				this._productsService.API('delete',
					new HttpParams()
						.set('operation', 'delete')
						.set('owner', this._appService.userInfo.username)
						.set('cookie', this._appService.userInfo.cookie)
						.set('stamps', this._appService.deleteSelection.toString()))
				break;
			case '/fd/recipes':
				this._recipesService.API('delete',
					new HttpParams()
						.set('operation', 'delete')
						.set('owner', this._appService.userInfo.username)
						.set('cookie', this._appService.userInfo.cookie)
						.set('stamps', this._appService.deleteSelection.toString()))
				break;
			case '/sp/supplements':
				this._supplementsService.API('delete',
					new HttpParams()
						.set('operation', 'delete')
						.set('owner', this._appService.userInfo.username)
						.set('cookie', this._appService.userInfo.cookie)
						.set('stamps', this._appService.deleteSelection.toString()))
				break;
		}
	};
}
