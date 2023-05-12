import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BambiService } from 'src/app/services/bambi.service';
import { MatPaginator } from '@angular/material/paginator';
import { ProductsService } from './products.service';
import { HttpParams } from '@angular/common/http';
import { IListProduct } from 'src/app/interfaces/Fd';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { DeleteConfirmationDialogComponent } from 'src/app/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { FdService, ProductChannelResult } from '../fd.service';

@Component({
	selector: 'bl-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss']
})

export class ProductsComponent implements OnInit, OnDestroy {
	//progress bar control
	loadingComplete: boolean = false;

	// mainform list
	recordList: IListProduct[] = [];
	dataSource: MatTableDataSource<IListProduct> = new MatTableDataSource<IListProduct>;
	displayedColumns: string[] = ['check', 'image', 'title', 'tags'];

	// checkboxes control
	selectedRecords: string[] = [];

	constructor(
		public bambiService: BambiService,
		public productsService: ProductsService,
		public fdService: FdService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar) { }

	ngOnInit(): void {
		// subs
		this.fdService.productListChannel = new Subject<ProductChannelResult>;
		this.fdService.productDeleteChannel = new Subject<ProductChannelResult>;

		this.fdService.productListChannel.subscribe(result => { this.showRecordList(result); });
		this.fdService.productDeleteChannel.subscribe(result => { this.refreshRecordListFromDelete(result); });

		this.productsService.API('getlist', new HttpParams().set('operation', 'getlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));
	}


	ngOnDestroy(): void {
		// subs
		this.fdService.productListChannel.complete();
		this.fdService.productDeleteChannel.complete();
	}


	@ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) { this.dataSource.paginator = paginator; }

	// listing (triggered by load subject)
	showRecordList(result: ProductChannelResult): void {
		if (result.sucess) {
			this.recordList = result.recordList!;
			this.dataSource = new MatTableDataSource<IListProduct>(this.recordList);
		}

		if (!result.sucess) {
			switch (result.details) {
				case 'no-products-found':
					this.recordList = [];
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details)
					break;
			}
		}

		this.loadingComplete = true;
	}

	// listing (triggered by delete subject)
	refreshRecordListFromDelete(result: ProductChannelResult): void {
		// sucessfull deleted records
		if (result.sucess) {
			// reseting selection array
			this.bambiService.deleteSelection = [];
			this.selectedRecords = [];

			// snackbar fire
			result.details === "user-owns-some" ?
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.SOMEPRODUCTDELETED', emoji: '🚮' } }) :
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.ALLPRODUCTDELETED', emoji: '🚮' } })

			// fetch updated listing
			this.productsService.API('getlist',
				new HttpParams()
					.set('operation', 'getlist')
					.set('owner', this.bambiService.userInfo.username)
					.set('cookie', this.bambiService.userInfo.cookie));
		}

		// error deleting records
		if (!result.sucess) {
			switch (result.details) {
				case 'user-owns-none':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.NONEPRODUCTDELETED', emoji: '🚯' } });
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details);
					break;
			}
		}
	}

	// product details dialog
	showDetails(productstamp: string): void {
		this._dialog.open(ProductDetailsComponent, { width: '50vw', height: '400px', panelClass: [this.bambiService.appTheme + '-theme'] });
		this.productsService.API('getdetails',  new HttpParams().set('operation', 'getdetails').set('stamp', productstamp).set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));
	}

	// introduction mode
	addNewProduct(): void {
		this.fdService.drawerOpen = true;
		this.productsService.recordDetails = {
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

	// update selected records
	selectItem(target: EventTarget, stamp: string): void {
		const newTarget = target as HTMLInputElement;

		// adding
		if (newTarget.checked && !this.selectedRecords.includes(stamp)) { this.selectedRecords.push(stamp); }

		// removing
		if (!newTarget.checked && this.selectedRecords.includes(stamp)) {
			const recordIndex = this.selectedRecords.indexOf(stamp);
			const slice1 = this.selectedRecords.slice(0, recordIndex);
			const slice2 = this.selectedRecords.slice(recordIndex + 1);
			this.selectedRecords = [...slice1, ...slice2];
		}
	}

	// delete selected records
	deleteSelected(): void {
		this.bambiService.deleteSelection = this.selectedRecords;
		this._dialog.open(DeleteConfirmationDialogComponent, { width: '500px', height: '220px', panelClass: [this.bambiService.appTheme + '-theme'] });
	}
}
