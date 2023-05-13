import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AppService } from 'src/app/services/app.service';
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
		public appService: AppService,
		public productsService: ProductsService,
		public fdService: FdService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar) { };

	ngOnInit(): void {

		this.fdService.productListChannel = new Subject<ProductChannelResult>;
		this.fdService.productDeleteChannel = new Subject<ProductChannelResult>;

		this.fdService.productListChannel.subscribe(result => { this.showRecordList(result) });
		this.fdService.productDeleteChannel.subscribe(result => { this.refreshRecordListFromDelete(result) });

		this.productsService.API('getlist',
			new HttpParams()
				.set('operation', 'getlist')
				.set('owner', this.appService.userInfo.username)
				.set('cookie', this.appService.userInfo.cookie));
	};

	ngOnDestroy(): void {

		this.fdService.productListChannel.complete();
		this.fdService.productDeleteChannel.complete();
	};

	@ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) { this.dataSource.paginator = paginator };

	showRecordList(result: ProductChannelResult): void {
		this.loadingComplete = true;

		if (result.sucess) {
			this.recordList = result.recordList!;
			this.dataSource = new MatTableDataSource<IListProduct>(this.recordList);
		};

		if (!result.sucess) {
			switch (result.details) {
				case 'no-records-found':
					this.recordList = [];
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.UNREACHABLE-SERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details);
					break;
			};
		};
	};

	refreshRecordListFromDelete(result: ProductChannelResult): void {

		if (result.sucess) {

			this.selectedRecords.length > 1 ?
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'SNACKS.DELETED-PRODUCTS', emoji: '🚮' } })
				: this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'SNACKS.DELETED-PRODUCT', emoji: '🚮' } })

			this.appService.deleteSelection = [];
			this.selectedRecords = [];

			this.productsService.API('getlist',
				new HttpParams()
					.set('operation', 'getlist')
					.set('owner', this.appService.userInfo.username)
					.set('cookie', this.appService.userInfo.cookie));
		};

		if (!result.sucess) {
			switch (result.details) {
				case 'user-owns-none':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'SNACKS.CANT-DELETE-PRODUCT', emoji: '🚯' } });
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'SNACKS.UNREACHABLE-SERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details);
					break;
			};
		};
	};

	// product details dialog
	showDetails(productstamp: string): void {
		this._dialog.open(ProductDetailsComponent, { width: '50vw', height: '400px', panelClass: [this.appService.appTheme + '-theme'] });
		this.productsService.API('getdetails', new HttpParams().set('operation', 'getdetails').set('stamp', productstamp).set('owner', this.appService.userInfo.username).set('cookie', this.appService.userInfo.cookie));
	};

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
			owner: this.appService.userInfo.username,
			public: false,
			inactive: false,
			timestamp: Date.now()
		};
	};

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
	};

	// delete selected records
	deleteSelected(): void {
		this.appService.deleteSelection = this.selectedRecords;
		this._dialog.open(DeleteConfirmationDialogComponent, { width: '500px', height: '220px', panelClass: [this.appService.appTheme + '-theme'] });
	};
};
