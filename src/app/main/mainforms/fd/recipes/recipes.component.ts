import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { IListRecipe } from 'src/app/interfaces/Fd';
import { AppService } from 'src/app/services/app.service';
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
	recordList: IListRecipe[] = [];
	dataSource: MatTableDataSource<IListRecipe> = new MatTableDataSource<IListRecipe>;
	displayedColumns: string[] = ['check', 'image', 'title', 'tags'];

	// checkboxes control
	selectedRecords: string[] = [];

	constructor(
		private _appService: AppService,
		private _recipeService: RecipesService,
		private _fdService: FdService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar
	) { }

	ngOnInit(): void {

		this._fdService.recipeListChannel = new Subject<RecipeChannelResult>;
		this._fdService.recipeDeleteChannel = new Subject<RecipeChannelResult>;

		this._fdService.recipeListChannel.subscribe(result => { this.showRecordList(result); });
		this._fdService.recipeDeleteChannel.subscribe(result => { this.refreshRecordListFromDelete(result); });

		this._recipeService.API('getlist',
			new HttpParams()
				.set('operation', 'getlist')
				.set('owner', this._appService.userInfo.username)
				.set('cookie', this._appService.userInfo.cookie));
	}

	ngOnDestroy(): void {
		this._fdService.recipeListChannel.complete();
		this._fdService.recipeDeleteChannel.complete();
	}

	recipeService(property: string): any { return this._recipeService[`${property}` as keyof typeof this._recipeService] };

	appService(property: string): any { return this._appService[`${property}` as keyof typeof this._appService] };

	@ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) { this.dataSource.paginator = paginator; }

	// listing (triggered by load subject)
	showRecordList(result: RecipeChannelResult): void {
		if (result.sucess) {
			this.recordList = result.recordList!;
			this.dataSource = new MatTableDataSource<IListRecipe>(this.recordList);
		}

		if (!result.sucess) {
			switch (result.details) {
				case 'no-records-found':
					this.recordList = [];
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.UNREACHABLE-SERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details)
					break;
			}
		}

		this.loadingComplete = true;
	}

	// listing (triggered by delete subject)
	refreshRecordListFromDelete(result: RecipeChannelResult): void {
		// sucessfull deleted records
		if (result.sucess) {
			// snackbar fire
			this.selectedRecords.length > 1 ?
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], data: { label: 'SNACKS.DELETED-RECIPES', emoji: '🚮' } }) :
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], data: { label: 'SNACKS.DELETED-RECIPE', emoji: '🚮' } })

			// reseting selection array
			this._appService.deleteSelection = [];
			this.selectedRecords = [];

			// fetch updated listing
			this._recipeService.API('getlist',
				new HttpParams()
					.set('operation', 'getlist')
					.set('owner', this._appService.userInfo.username)
					.set('cookie', this._appService.userInfo.cookie));
		}

		// error deleting records
		if (!result.sucess) {
			switch (result.details) {
				case 'user-owns-none':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], data: { label: 'SNACKS.CANT-DELETE-RECIPE', emoji: '🚯' } });
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], data: { label: 'SNACKS.UNREACHABLE-SERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details);
					break;
			}
		}
	}

	// product details dialog
	showDetails(productstamp: string): void {
		this._dialog.open(RecipeDetailsComponent, { width: '50vw', height: '400px', panelClass: [this._appService.appTheme + '-theme'] });
		this._recipeService.API('getdetails', new HttpParams().set('operation', 'getdetails').set('stamp', productstamp).set('owner', this._appService.userInfo.username).set('cookie', this._appService.userInfo.cookie));
	}

	// introduction mode
	addNewRecord(): void {
		this._fdService.drawerOpen = true;
		this._recipeService.recordDetails = {
			stamp: '',
			title: '',
			image: '',
			tags: [],
			kcal: 0,
			unit: 'g',
			unitvalue: 0,
			price: 0,
			owner: this._appService.userInfo.username,
			public: false,
			inactive: false,
			timestamp: Date.now(),
			recipemats:[]
		};
	}

	// update selected records
	selectItem(target: EventTarget, stamp: string): void {
		const newTarget = target as HTMLInputElement;

		// adding
		if (newTarget.checked && !this.selectedRecords.includes(stamp)) { this.selectedRecords.push(stamp); }

		// removing
		if (!newTarget.checked && this.selectedRecords.includes(stamp)) {
			const productIndex = this.selectedRecords.indexOf(stamp);
			const slice1 = this.selectedRecords.slice(0, productIndex);
			const slice2 = this.selectedRecords.slice(productIndex + 1);
			this.selectedRecords = [...slice1, ...slice2];
		}
	}

	// delete selected records
	deleteSelected(): void {
		this._appService.deleteSelection = this.selectedRecords;
		this._dialog.open(DeleteConfirmationDialogComponent, { width: '500px', height: '220px', panelClass: [this._appService.appTheme + '-theme'] });
	}

}
