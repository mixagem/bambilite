import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { IDetailsProduct } from 'src/app/interfaces/Fd';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ImageUploadComponent } from 'src/app/components/image-upload/image-upload.component';
import { BambiService } from 'src/app/services/bambi.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { Observable, Subject, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { NavigationStart, Router } from '@angular/router';
import { HeaderService } from 'src/app/main/header/header.service';
import { FdService, ProductChannelResult } from '../../fd.service';

type AutocompleteOption = {
	title: string,
	value: string
}

@Component({
	selector: 'bl-product-edit',
	templateUrl: './product-edit.component.html',
	styleUrls: ['./product-edit.component.scss']
})


export class ProductEditComponent implements OnInit {
	// progress bar control
	loadingComplete: boolean = false;

	defaultOptions: AutocompleteOption[] = [
		{ title: "Grama (g)", value: "g" },
		{ title: "Kilograma (kg)", value: "kg" },
		{ title: "Mililitro (ml)", value: "ml" },
		{ title: "Litro (L)", value: "L" }
	]

	filteredOptions: Observable<AutocompleteOption[]> = new Observable<AutocompleteOption[]>;

	// operation type (new / update) control
	isNewProduct: boolean = false;

	// discard control
	isDiscarding: boolean = false;

	// mat-chips input separator
	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	// product details clone (so we can freely change and discard changes without BD calls)
	productDetailsDraft: IDetailsProduct

	/*
	[user uploads here>] bambiService -> uploaded/reseted image used in the imagepicker component.
	[if he accepts the changes in the imagepicker>] productsService -> image of the current draft, used in the edit view and imagepicker component
	[if he saves the changes to the record, we productDetailsDraft -> first record's image - not used because we need middleman (productsService) beeween the imagepicker and this component
	*/

	// form
	productForm: FormGroup = new FormGroup({});

	constructor(
		public productsService: ProductsService,
		public router: Router,
		private _bambiService: BambiService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar,
		public fdService: FdService,
		private _headerService: HeaderService) {

		// closing drawer on changing to a diffrent fd child
		router.events.forEach((event) => {
			if (event instanceof NavigationStart) {
				this.closeEditMode();
			}
		});

		// cloning last preview product
		this.productDetailsDraft = this.productsService.productDetails

		// productsService clone
		this.productsService.tempB64Img = this.productDetailsDraft.image;

		// form control gen
		this.generateFormControls();
	}

	ngOnInit(): void {
		this.formControlsUpdate();

		// subs
		this.fdService.productUpdateChannel = new Subject<ProductChannelResult>;
		this.fdService.productUpdateChannel.subscribe(result => { this.saveFinished(result); });

		// disabling header search input
		this._headerService.inputsForm.get('simpleQueryFormControl')!.disable({ emitEvent: false });

		this.productForm.get('price')!.valueChanges.subscribe((price: number) => {
			if (!price || isNaN(Number(price))) { return }
			this.productForm.get('pricebyratio')!.setValue(this.productsService.GetPriceByRatio(price, this.productForm.get('unitvalue')!.value, this.productForm.get('unit')!.value), { emitEvent: false })
		})

		this.productForm.get('pricebyratio')!.valueChanges.subscribe((pricebyratio: number) => {
			if (!pricebyratio || isNaN(Number(pricebyratio))) { return }
			this.productForm.get('price')!.setValue(this.productsService.GetPriceByQuantity(pricebyratio, this.productForm.get('unitvalue')!.value, this.productForm.get('unit')!.value), { emitEvent: false })
		})

		this.productForm.get('unit')!.valueChanges.subscribe(_ => { this.productForm.get('pricebyratio')!.setValue(this.productsService.GetPriceByRatio(this.productForm.get('price')!.value, this.productForm.get('unitvalue')!.value, _), { emitEvent: false }) })

		this.productForm.get('unitvalue')!.valueChanges.subscribe(_ => {
			if (!_ || isNaN(Number(_)) || _ == 0) { return }
			this.productForm.get('pricebyratio')!.setValue(this.productsService.GetPriceByRatio(this.productForm.get('price')!.value, _, this.productForm.get('unit')!.value), { emitEvent: false })
		})

		this.productForm.get('kcal')!.valueChanges.subscribe(_ => {
			if (!_ || isNaN(Number(_)) || _ == 0) { return }
			this.productForm.get('kcalby100')!.setValue(this.productsService.GetKcalBy100(_, this.productForm.get('unitvalue')!.value, this.productForm.get('unit')!.value), { emitEvent: false })
		})

		this.productForm.get('kcalby100')!.valueChanges.subscribe(_ => {
			if (!_ || isNaN(Number(_)) || _ == 0) { return }
			this.productForm.get('kcal')!.setValue(this.productsService.GetKcal(_, this.productForm.get('unitvalue')!.value, this.productForm.get('unit')!.value), { emitEvent: false })
		})

	}


	ngOnDestroy(): void {
		// subs
		this.fdService.productUpdateChannel.complete();
		// wise to clean any images that are not used
		this.productsService.tempB64Img = '';
		// re-enabling header search input
		this._headerService.inputsForm.get('simpleQueryFormControl')!.enable({ emitEvent: false });
	}

	generateFormControls(): void {
		Object.keys(this.productDetailsDraft).forEach(key => {
			switch (key) {
				case 'stamp':
				case 'owner':
				case 'tags':
				case 'image':
					// fields not to create form control
					break;
				case 'unit':
				case 'title':
					// required fields
					this.productForm.addControl(key, new FormControl(this.productDetailsDraft[key], [Validators.required]));
					break;
				case 'kcal':
				case 'unitvalue':
				case 'price':
					// number patterns validator
					this.productForm.addControl(key, new FormControl(this.productDetailsDraft[key], [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]));
					break;
				default:
					this.productForm.addControl(key, new FormControl(this.productDetailsDraft[key as keyof typeof this.productDetailsDraft]));
			}
		});

		let pbr = this.productsService.GetPriceByRatio(this.productForm.get('price')!.value, this.productForm.get('unitvalue')!.value, this.productForm.get('unit')!.value);
		let kb1 = this.productsService.GetKcalBy100(this.productForm.get('kcal')!.value, this.productForm.get('unitvalue')!.value, this.productForm.get('unit')!.value);

		this.productForm.addControl('pricebyratio', new FormControl(isNaN(pbr)? 0 : pbr, [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]));

		this.productForm.addControl('kcalby100', new FormControl(isNaN(kb1)? 0 : pbr, [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]))

	}

	// Validators.pattern("^[0-9]*$")
	// mainform action click
	saveProduct(): void {
		this.loadingComplete = false;
		this.isNewProduct = !this.productDetailsDraft.stamp

		this.productDetailsDraft.timestamp = Date.now();
		this.productDetailsDraft.image = this.productsService.tempB64Img;
		this.productDetailsDraft.kcal = this.productForm.get('kcal')!.value
		this.productDetailsDraft.title = this.productForm.get('title')!.value
		this.productDetailsDraft.unit = this.productForm.get('unit')!.value
		this.productDetailsDraft.unitvalue = this.productForm.get('unitvalue')!.value
		this.productDetailsDraft.price = this.productForm.get('price')!.value
		this.productDetailsDraft.public = this.productForm.get('public')!.value
		this.productDetailsDraft.inactive = this.productForm.get('inactive')!.value

		const operation = !!this.productDetailsDraft.stamp ? 'update' : 'new'
		const httpParams =
			new HttpParams()
				.set('operation', operation)
				.set('cookie', this._bambiService.userInfo.cookie)
				.set('owner', this._bambiService.userInfo.username)
				.set('product', JSON.stringify(this.productDetailsDraft))

		this.productsService.API(operation, httpParams)
	}

	// triggered by the response from the update product call
	saveFinished(result: ProductChannelResult): void {
		this.loadingComplete = true;
		// disparar snackbars aqui?
		if (result.sucess) {
			this.closeEditMode(true);
			this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: this.isNewProduct ? 'APPSNACKS.PRODUCTCREATED' : 'APPSNACKS.PRODUCTUPDATED', emoji: '🥝' } });
		}
		else {
			switch (result.details) {
				case 'product-not-found':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'APPSNACKS.PRODUCT-NOTFOUND', emoji: '🚫' } });
					return;
				case 'user-not-owner':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'APPSNACKS.USER-NOTOWNER', emoji: '🚫' } });
					return;
				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, panelClass: ['app-snackbar', `${this._bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					return;
			}
		}

	}

	// triggered when update product api call is over, and also when discarding changes
	closeEditMode(updatedProduct: boolean = false): void {
		// drawer closing animation
		this.fdService.drawerFadeout = true;
		setTimeout(() => {
			this.fdService.drawerOpen = false;
			this.fdService.drawerFadeout = false;
		}, 1000);

		if (updatedProduct) {
			this.productsService.API('getlist',
				new HttpParams()
					.set('operation', 'getlist')
					.set('owner', this._bambiService.userInfo.username)
					.set('cookie', this._bambiService.userInfo.cookie));
		}
	}

	// disabling checkboxes for shared records
	formControlsUpdate(): void {
		if (this.productDetailsDraft.public) {
			this.productForm.get('public')!.disable()
			this.productForm.get('inactive')!.disable()
		}
	}

	// imagepicker
	newPicUpload(): void {
		this._dialog.open(ImageUploadComponent, { width: '50vw', height: '400px', panelClass: [this._bambiService.appTheme + '-theme'] });
	}

	// tags
	addTag(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();

		if (!this.productDetailsDraft.tags) { this.productDetailsDraft.tags = [] }
		if (value && !this.productDetailsDraft.tags.includes(value)) { this.productDetailsDraft.tags.push(value) }

		event.chipInput!.clear();
	}

	removeTag(tag: string): void {
		const index = this.productDetailsDraft.tags.indexOf(tag);
		this.productDetailsDraft.tags = [...this.productDetailsDraft.tags.slice(0, index), ...this.productDetailsDraft.tags.slice(index + 1)];
	}

	editTag(tag: string, event: MatChipEditedEvent): void {
		const value = event.value.trim();

		if (!value) { this.removeTag(tag); return; }

		const index = this.productDetailsDraft.tags.indexOf(tag);
		if (index >= 0) { this.productDetailsDraft.tags[index] = value; }
	}
}