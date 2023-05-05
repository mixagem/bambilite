import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BambiService } from 'src/app/services/bambi.service';
import { MatPaginator } from '@angular/material/paginator';
import { HeaderBreadcumbsService } from 'src/app/main/header-breadcumbs/header-breadcumbs.service';
import { ProductChannelResult, SubjectChannelsService } from 'src/app/services/subject-channels.service';
import { FdService } from '../fd.service';
import { HttpParams } from '@angular/common/http';
import { IListProduct } from 'src/app/interfaces/FdTypes';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { Subject } from 'rxjs';
import { HeaderService } from 'src/app/main/header/header.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';


@Component({
	selector: 'bl-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss']
})

export class ProductsComponent implements OnInit {

	//progress bar control
	loadingComplete: boolean = false;

	//mainform list
	productList: IListProduct[] = [];
	dataSource: MatTableDataSource<IListProduct> = new MatTableDataSource<IListProduct>;
	displayedColumns: string[] = [];

	//checkboxes control
	selectedProducts: string[] = [];

	constructor(public breadcumbsService: HeaderBreadcumbsService, public bambiService: BambiService, private _channelsService: SubjectChannelsService, public fdService: FdService, private _dialog: MatDialog, private _headerService: HeaderService, private _snackBar: MatSnackBar) {
	}


	ngOnInit(): void {
		this._channelsService.productListChannel.subscribe(result => { this.showProductList(result); });
		this._channelsService.productDeleteChannel.subscribe(result => { this.refreshProductListFromDelete(result); });
		this.fdService.API('getlist', new HttpParams().set('operation', 'getlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));
		this._headerService.currentRoute = 'products'
	}

	@ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
		this.dataSource.paginator = paginator;
	}

	ngOnDestroy(): void {
		this._channelsService.productListChannel = new Subject<ProductChannelResult>;
		this._channelsService.productDeleteChannel = new Subject<ProductChannelResult>;
		this._headerService.currentRoute = ''
	}

	showDetails(productstamp: string) {
		this._dialog.open(ProductDetailsComponent, {
			width: '50vw',
			height: '400px',
			panelClass: [this.bambiService.appTheme + '-theme']
		});

		this.fdService.API('getdetails', new HttpParams().set('operation', 'getdetails').set('stamp', productstamp).set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));

	}

	refreshProductListFromDelete(result: ProductChannelResult) {
		if (result.sucess) {
			this.selectedProducts = [];
			this.fdService.API('getlist', new HttpParams().set('operation', 'getlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie));

			result.details === "user-owns-some" ? this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.SOMEPRODUCTDELETED', emoji: '🚮' } }) : this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.ALLPRODUCTDELETED', emoji: '🚮' } })
		}

		if (!result.sucess) {
			switch (result.details) {
				case 'user-owns-none':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.NONEPRODUCTDELETED', emoji: '🚯' } });
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					break;

			}
		}

	}

	showProductList(result: ProductChannelResult) {
		if (result.sucess) {
			this.productList = result.products!;
			this.displayedColumns = ['check', 'image', 'title', 'tags'];
			this.dataSource = new MatTableDataSource<IListProduct>(this.productList);
		}

		if (!result.sucess) {
			switch (result.details) {
				case 'no-products-found':
					this.productList = [];
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					break;

			}
		}

		this.loadingComplete = true;
	}

	selectItem(target: EventTarget, stamp: string) {
		const newTarget = target as HTMLInputElement;

		if (newTarget.checked && !this.selectedProducts.includes(stamp)) {
			this.selectedProducts.push(stamp);
		}

		if (!newTarget.checked && this.selectedProducts.includes(stamp)) {
			const productIndex = this.selectedProducts.indexOf(stamp);
			const slice1 = this.selectedProducts.slice(0, productIndex);
			const slice2 = this.selectedProducts.slice(productIndex + 1);
			this.selectedProducts = [...slice1, ...slice2];
		}
	}

	addNewProduct() {
		this.fdService.drawerOpen = true;
		this.fdService.productDetails = { stamp: '', title: 'Novo produto', image: '', tags: [], kcal: 0, unit: '', unitvalue: 0, price: 0, owner: this.bambiService.userInfo.username, public: false, inactive: false, timestamp: Date.now() };
	}

	deleteSelected() {
		// abrir modal, e só na modal é que confirmo o pedido abaixo -v
		this.fdService.API('delete', new HttpParams().set('operation', 'delete').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('stamps', this.selectedProducts.toString()));
	}
}
