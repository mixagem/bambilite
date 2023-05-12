import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { IListRecipe } from 'src/app/interfaces/Fd';
import { BambiService } from 'src/app/services/bambi.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from 'src/app/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { Subject } from 'rxjs';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpParams } from '@angular/common/http';
import { FdService, RecipeChannelResult } from '../fd.service';
import { RecipesService } from './recipes.service';
import { MatPaginator } from '@angular/material/paginator';
import { RecipeDetailsComponent } from './recipe-details/recipe-details.component';

@Component({
	selector: 'bl-recipes',
	templateUrl: './recipes.component.html',
	styleUrls: ['./recipes.component.scss']
})


export class RecipesComponent implements OnInit, OnDestroy {
	//progress bar control
	loadingComplete: boolean = false;

	// mainform list
	recipeList: IListRecipe[] = [];
	dataSource: MatTableDataSource<IListRecipe> = new MatTableDataSource<IListRecipe>;
	displayedColumns: string[] = ['check', 'image', 'title', 'tags'];

	// checkboxes control
	selectedRecipes: string[] = [];

	constructor(
		public bambiService: BambiService,
		public recipeService: RecipesService,
		private _fdService: FdService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar
	) { }

	ngOnInit(): void {

		this._fdService.recipeListChannel = new Subject<RecipeChannelResult>;
		this._fdService.recipeDeleteChannel = new Subject<RecipeChannelResult>;

		this._fdService.recipeListChannel.subscribe(result => { this.showRecipeList(result); });
		this._fdService.recipeDeleteChannel.subscribe(result => { this.refreshRecipeListFromDelete(result); });

		this.recipeService.API('getlist',new HttpParams().set('operation', 'getlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));
	}

	@ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) { this.dataSource.paginator = paginator; }

	ngOnDestroy(): void {
		// subs
		this._fdService.recipeDeleteChannel.complete();
	}

	// listing (triggered by load subject)
	showRecipeList(result: RecipeChannelResult): void {
		if (result.sucess) {
			this.recipeList = result.recipes!;
			this.dataSource = new MatTableDataSource<IListRecipe>(this.recipeList);
		}

		if (!result.sucess) {
			switch (result.details) {
				case 'no-recipes-found':
					this.recipeList = [];
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details)
					break;
			}
		}

		this.loadingComplete = true;
	}

	// introduction mode
	addNewRecipe(): void {
		this._fdService.drawerOpen = true;
		this.recipeService.recipeDetails = {
			stamp: '',
			title: '',
			image: '',
			tags: [],
			kcal: 0,
			unit: 'g',
			unitvalue: 0,
			price: 0,
			owner: this.bambiService.userInfo.username,
			public: false,
			inactive: false,
			timestamp: Date.now()
		};
	}

	// delete selected records
	deleteSelected(): void {
		this.bambiService.deleteSelection = this.selectedRecipes;
		this._dialog.open(DeleteConfirmationDialogComponent, { width: '500px', height: '220px', panelClass: [this.bambiService.appTheme + '-theme'] });
	}

	// listing (triggered by delete subject)
	refreshRecipeListFromDelete(result: RecipeChannelResult): void {
		// sucessfull deleted records
		if (result.sucess) {
			// reseting selection array
			this.bambiService.deleteSelection = [];
			this.selectedRecipes = [];

			// snackbar fire
			result.details === "user-owns-some" ?
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.SOMERECIPESDELETED', emoji: '🚮' } }) :
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.ALLRECIPESDELETED', emoji: '🚮' } })

			// fetch updated listing
			this.recipeService.API('getlist',
				new HttpParams()
					.set('operation', 'getlist')
					.set('owner', this.bambiService.userInfo.username)
					.set('cookie', this.bambiService.userInfo.cookie));
		}

		// error deleting records
		if (!result.sucess) {
			switch (result.details) {
				case 'user-owns-none':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.NONERECIPESDELETED', emoji: '🚯' } });
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details);
					break;
			}
		}
	}

		// update selected records
		selectItem(target: EventTarget, stamp: string): void {
			const newTarget = target as HTMLInputElement;

			// adding
			if (newTarget.checked && !this.selectedRecipes.includes(stamp)) { this.selectedRecipes.push(stamp); }

			// removing
			if (!newTarget.checked && this.selectedRecipes.includes(stamp)) {
				const productIndex = this.selectedRecipes.indexOf(stamp);
				const slice1 = this.selectedRecipes.slice(0, productIndex);
				const slice2 = this.selectedRecipes.slice(productIndex + 1);
				this.selectedRecipes = [...slice1, ...slice2];
			}
		}


		// product details dialog
		showDetails(productstamp: string): void {
			this._dialog.open(RecipeDetailsComponent, { width: '50vw', height: '400px', panelClass: [this.bambiService.appTheme + '-theme'] });
			this.recipeService.API('getdetails',  new HttpParams().set('operation', 'getdetails').set('stamp', productstamp).set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));
		}

}
