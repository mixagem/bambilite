import { Component, OnInit } from '@angular/core';
import { FdService } from '../../fd.service';
import { IDetailsProduct } from 'src/app/interfaces/FdTypes';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ImageUploadComponent } from 'src/app/components/image-upload/image-upload.component';
import { BambiService } from 'src/app/services/bambi.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { ProductChannelResult, SubjectChannelsService } from 'src/app/services/subject-channels.service';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';

@Component({
	selector: 'bl-product-edit',
	templateUrl: './product-edit.component.html',
	styleUrls: ['./product-edit.component.scss']
})


export class ProductEditComponent implements OnInit {
	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	productDetailsDraft: IDetailsProduct
	productForm: FormGroup = new FormGroup({});

	loadingComplete: boolean = true;

	constructor(private _snackBar: MatSnackBar, public fdService: FdService, private _bambiService: BambiService, private _dialog: MatDialog, private _channelsService: SubjectChannelsService) {

		this.productDetailsDraft = this.fdService.productDetails

		this.generateFormControls();
		this.fdService.tempImage = this.productDetailsDraft.image;
	}

	ngOnInit(): void {
		this.formControlsUpdate();

		this._channelsService.productUpdateChannel = new Subject<ProductChannelResult>;
		this._channelsService.productUpdateChannel.subscribe(result => { this.saveFinished(result); });
	}

	ngOnDestroy(): void {
		this._channelsService.productUpdateChannel = new Subject<ProductChannelResult>;
	}

	generateFormControls() {
		Object.keys(this.productDetailsDraft).forEach(key => {
			switch (key) {
				case 'stamp':
				case 'owner':
				case 'tags':
				case 'image': //fields not to create form control
					break;
				case 'title': //required fields
					this.productForm.addControl(key, new FormControl(this.productDetailsDraft[key], [Validators.required]));
					break;
				default:
					this.productForm.addControl(key, new FormControl(this.productDetailsDraft[key as keyof typeof this.productDetailsDraft]));
			}
		});
	}

	closeEditMode(updatedProduct: boolean = false) {
		if (updatedProduct) {
			this.fdService.API('getlist', new HttpParams().set('operation', 'getlist').set('owner', this._bambiService.userInfo.username).set('cookie', this._bambiService.userInfo.cookie));
		}

		this.fdService.drawerFadeout = true;
		setTimeout(() => {
			this.fdService.drawerOpen = false;
			this.fdService.drawerFadeout = false;
		}, 1000);
	}


	saveProduct() {
		this.loadingComplete = false;
		this.productDetailsDraft.timestamp = Date.now();

		this.productDetailsDraft.image = this.fdService.tempImage;
		this.productDetailsDraft.kcal = this.productForm.get('kcal')?.value
		this.productDetailsDraft.title = this.productForm.get('title')?.value
		this.productDetailsDraft.unit = this.productForm.get('unit')?.value
		this.productDetailsDraft.unitvalue = this.productForm.get('unitvalue')?.value
		this.productDetailsDraft.price = this.productForm.get('price')?.value
		this.productDetailsDraft.public = this.productForm.get('public')?.value
		this.productDetailsDraft.inactive = this.productForm.get('inactive')?.value

		const operation = !!this.productDetailsDraft.stamp ? 'update' : 'new'
		const httpParams = new HttpParams().set('operation', operation).set('cookie', this._bambiService.userInfo.cookie).set('owner', this._bambiService.userInfo.username).set('product', JSON.stringify(this.productDetailsDraft))

		this.fdService.API(operation, httpParams)
	}

	saveFinished(result: ProductChannelResult) {
		this.loadingComplete = true;
		// disparar snackbars aqui?
		if (result.sucess) {
			this.closeEditMode(true);
			this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.PRODUCTUPDATED', emoji: '🥝' } });
		}
		else {
			switch (result.details) {
				case 'product-not-found':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this._bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.PRODUCT-NOTFOUND', emoji: '🚫' } });
					return;
				case 'user-not-owner':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this._bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.USER-NOTOWNER', emoji: '🚫' } });
					return;
				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, panelClass: ['landing-page-snackbar', `${this._bambiService.appTheme}-snack`], data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					return;
			}
		}

	}

	formControlsUpdate() {
		if (this.productDetailsDraft.public) {
			this.productForm.get('public')?.disable()
			this.productForm.get('inactive')?.disable()
		}
	}

	addTag(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();
		// Addtag
		if (!this.productDetailsDraft.tags) { this.productDetailsDraft.tags = [] }
		if (value && !this.productDetailsDraft.tags.includes(value)) {
			this.productDetailsDraft.tags.push(value)
		}

		// Clear the input value
		event.chipInput!.clear();
	}

	removeTag(tag: string): void {
		const index = this.productDetailsDraft.tags.indexOf(tag);
		this.productDetailsDraft.tags = [...this.productDetailsDraft.tags.slice(0, index), ...this.productDetailsDraft.tags.slice(index + 1)];
	}

	editTag(tag: string, event: MatChipEditedEvent) {
		const value = event.value.trim();

		// Remove fruit if it no longer has a name
		if (!value) {
			this.removeTag(tag);
			return;
		}

		// Edit existing fruit
		const index = this.productDetailsDraft.tags.indexOf(tag);
		if (index >= 0) {
			this.productDetailsDraft.tags[index] = value;
		}
	}

	newPicUpload() {
		this._dialog.open(ImageUploadComponent, {
			width: '50vw',
			height: '400px',
			panelClass: [this._bambiService.appTheme + '-theme']
		});
	}

}
