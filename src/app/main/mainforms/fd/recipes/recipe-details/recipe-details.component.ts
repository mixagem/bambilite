import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppService } from 'src/app/services/app.service';
import { FdService, RecipeChannelResult } from '../../fd.service';
import { RecipesService } from '../recipes.service';
import { Subject } from 'rxjs/internal/Subject';
import { RecordOperation } from 'src/app/interfaces/Generic';
import { HttpParams } from '@angular/common/http';

@Component({
	selector: 'bl-recipe-details',
	templateUrl: './recipe-details.component.html',
	styleUrls: ['./recipe-details.component.scss']
})

export class RecipeDetailsComponent implements OnInit, OnDestroy {
	// progress bar control
	loadingComplete: boolean = false;

	// deleting status control
	deletingRecord: boolean = false;

	constructor(
		public recipesService: RecipesService,
		private _dialogRef: MatDialogRef<any>,
		private _appService: AppService,
		public fdService: FdService) { }

	ngOnInit(): void {
		// subs
		this.fdService.recipeDetailsChannel = new Subject<RecipeChannelResult>;
		this.fdService.recipeDetailsChannel.subscribe(result => { this.showProductDetails(result); });
	}

	ngOnDestroy(): void {
		// subs
		this.fdService.recipeDetailsChannel.complete();
	}


	// fire details modal
	showProductDetails(result: RecipeChannelResult): void {
		this.loadingComplete = true;
		result.sucess ? this.recipesService.recordDetails = result.record! : console.error('bambilite connection error: ' + result.details);
	}

	// details modal actions
	recordOperation(operation: RecordOperation): void {
		switch (operation) {
			case 'update': case 'clone':
				if (operation === 'clone') {
					this.recipesService.recordDetails.stamp = ''
					this.recipesService.recordDetails.public = false
					this.recipesService.recordDetails.inactive = false
				}
				this.fdService.drawerOpen = true;
				this._dialogRef.close();
				break;
			case 'delete':
				this.deletingRecord = true;
				break;
		}
	}

	// delete confirmed
	deleteRecord(): void {
		this.recipesService.API('delete',
			new HttpParams()
				.set('operation', 'delete')
				.set('owner', this._appService.userInfo.username)
				.set('cookie', this._appService.userInfo.cookie)
				.set('stamps', this.recipesService.recordDetails.stamp))
	}
}
