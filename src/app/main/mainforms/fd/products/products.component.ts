import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BambiService } from 'src/app/services/bambi.service';
import { MatPaginator } from '@angular/material/paginator';
import { ProductChannelResult, SubjectChannelsService } from 'src/app/services/subject-channels.service';
import { FdService } from '../fd.service';
import { HttpParams } from '@angular/common/http';
import { IListProduct } from 'src/app/interfaces/Fd';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { DeleteConfirmationDialogComponent } from 'src/app/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
	selector: 'bl-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss']
})

export class ProductsComponent implements OnInit {
	//progress bar control
	loadingComplete: boolean = false;

	// mainform list
	productList: IListProduct[] = [];
	dataSource: MatTableDataSource<IListProduct> = new MatTableDataSource<IListProduct>;
	displayedColumns: string[] = ['check', 'image', 'title', 'tags'];

	// checkboxes control
	selectedProducts: string[] = [];

	constructor(
		public bambiService: BambiService,
		public fdService: FdService,
		private _channelsService: SubjectChannelsService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar) { }

	ngOnInit(): void {
		// subs
		this._channelsService.productListChannel = new Subject<ProductChannelResult>;
		this._channelsService.productDeleteChannel = new Subject<ProductChannelResult>;

		this._channelsService.productListChannel.subscribe(result => { this.showProductList(result); });
		this._channelsService.productDeleteChannel.subscribe(result => { this.refreshProductListFromDelete(result); });

		this.fdService.API('getlist', new HttpParams().set('operation', 'getlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));
	}

	@ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) { this.dataSource.paginator = paginator; }

	ngOnDestroy(): void {
		// subs
		this._channelsService.productListChannel.complete();
		this._channelsService.productDeleteChannel.complete();
	}

	// listing (triggered by load subject)
	showProductList(result: ProductChannelResult): void {
		if (result.sucess) {
			this.productList = result.products!;
			this.dataSource = new MatTableDataSource<IListProduct>(this.productList);
		}

		if (!result.sucess) {
			switch (result.details) {
				case 'no-products-found':
					this.productList = [];
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
	refreshProductListFromDelete(result: ProductChannelResult): void {
		// sucessfull deleted records
		if (result.sucess) {
			// reseting selection array
			this.bambiService.deleteSelection = [];
			this.selectedProducts = [];

			// snackbar fire
			result.details === "user-owns-some" ?
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.SOMEPRODUCTDELETED', emoji: '🚮' } }) :
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.ALLPRODUCTDELETED', emoji: '🚮' } })

			// fetch updated listing
			this.fdService.API('getlist',
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
		this.fdService.API('getdetails', new HttpParams().set('operation', 'getdetails').set('stamp', productstamp).set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));
	}

	// introduction mode
	addNewProduct(): void {
		this.fdService.drawerOpen = true;
		this.fdService.productDetails = {
			stamp: '',
			title: '',
			image: '',
			tags: [],
			kcal: 0,
			unit: '',
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
		if (newTarget.checked && !this.selectedProducts.includes(stamp)) { this.selectedProducts.push(stamp); }

		// removing
		if (!newTarget.checked && this.selectedProducts.includes(stamp)) {
			const productIndex = this.selectedProducts.indexOf(stamp);
			const slice1 = this.selectedProducts.slice(0, productIndex);
			const slice2 = this.selectedProducts.slice(productIndex + 1);
			this.selectedProducts = [...slice1, ...slice2];
		}
	}

	// delete selected records
	deleteSelected(): void {
		this.bambiService.deleteSelection = this.selectedProducts;
		this._dialog.open(DeleteConfirmationDialogComponent, { width: '500px', height: '220px', panelClass: [this.bambiService.appTheme + '-theme'] });
	}
}
