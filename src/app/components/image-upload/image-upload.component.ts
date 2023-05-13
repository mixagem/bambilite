import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ProductsService } from 'src/app/main/mainforms/fd/products/products.service';
import { RecipesService } from 'src/app/main/mainforms/fd/recipes/recipes.service';
import { SupplementsService } from 'src/app/main/mainforms/sp/supplements/supplements.service';
import { AppService } from 'src/app/services/app.service';
import { ImageChannelResult, SubjectChannelsService } from 'src/app/services/subject-channels.service';

@Component({
	selector: 'bl-image-upload',
	templateUrl: './image-upload.component.html',
	styleUrls: ['./image-upload.component.scss']
})

export class ImageUploadComponent implements OnInit, OnDestroy {
	loadingComplete: boolean = true;

	constructor(
		private _productsService: ProductsService,
		private _recipesService: RecipesService,
		private _supplementsService: SupplementsService,
		public appService: AppService,
		private _channelsService: SubjectChannelsService,
		private _router: Router) {
	}

	ngOnInit(): void {
		switch (this._router.url) {
			case '/fd/products':
				this.appService.tempB64Img = this._productsService.tempB64Img
				break;
			case '/fd/recipes':
				this.appService.tempB64Img = this._recipesService.tempB64Img
				break;
		}
		this._channelsService.imageUploadChannel.subscribe(result => { this.uploadFinished(result); });
	}

	ngOnDestroy(): void {
		this._channelsService.imageUploadChannel = new Subject<ImageChannelResult>;
	}


	imageSelected(fileInputEvent: any): void {
		this.loadingComplete = false;
		const file = fileInputEvent.target!.files[0];
		this.appService.ImageUpload(file);
	}

	uploadFinished(result: ImageChannelResult): void {
		this.loadingComplete = true;
		if (result.sucess) { this.appService.tempB64Img = result.b64! }
	}

	resetImage(): void { this.appService.tempB64Img = ''; }

	saveChanges(): void {
		switch (this._router.url) {
			case '/fd/products':
				this._productsService.tempB64Img = this.appService.tempB64Img
				break;
			case '/fd/recipes':
				this._recipesService.tempB64Img = this.appService.tempB64Img
				break;
			case '/sp/supplements':
				this._supplementsService.tempB64Img = this.appService.tempB64Img
				break;
		}
	}

	getImageSrc(): string {
		let imageSource = ''
		switch (this._router.url) {
			case '/fd/products':
				imageSource = this._productsService.tempB64Img
				break;

			case '/fd/recipes':
				imageSource = this._recipesService.tempB64Img
				break;

			case '/sp/supplements':
				imageSource = this._supplementsService.tempB64Img
				break;
		}
		return imageSource
	}
}
