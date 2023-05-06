import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FdService } from 'src/app/main/mainforms/fd/fd.service';
import { BambiService } from 'src/app/services/bambi.service';
import { ImageChannelResult, SubjectChannelsService } from 'src/app/services/subject-channels.service';

@Component({
	selector: 'bl-image-upload',
	templateUrl: './image-upload.component.html',
	styleUrls: ['./image-upload.component.scss']
})

export class ImageUploadComponent implements OnInit, OnDestroy {
	loadingComplete: boolean = true;

	constructor(public fdService: FdService, public bambiService: BambiService, private _channelsService: SubjectChannelsService, private _router: Router) {
	}

	imageSelected(fileInputEvent: any) {
		this.loadingComplete = false;
		const file = fileInputEvent.target!.files[0];
		this.bambiService.ImageUpload(file);
	}

	ngOnInit(): void {
		switch (this._router.url) {
			case '/fd/products':
				this.bambiService.tempB64Img = this.fdService.tempB64Img
				break;
		}
		this._channelsService.imageUploadChannel.subscribe(result => { this.uploadFinished(result); });
	}

	ngOnDestroy(): void {
		this._channelsService.imageUploadChannel = new Subject<ImageChannelResult>;
	}

	uploadFinished(result: ImageChannelResult) {
		this.loadingComplete = true;
		if (result.sucess) { this.bambiService.tempB64Img = result.b64! }
	}

	resetImage() { this.bambiService.tempB64Img = ''; }
	saveChanges() {
		switch (this._router.url) {
			case '/fd/products':
				this.fdService.tempB64Img = this.bambiService.tempB64Img
				break;
		}

	}
}
