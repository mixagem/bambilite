import { Component, OnDestroy, OnInit } from '@angular/core';
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
	tempFile: File = new File([], '');
	currentImage: string = this._fdService.tempImage

	constructor(private _fdService: FdService, public bambiService: BambiService, private _channelsService: SubjectChannelsService) {
	}

	imageSelected(fileInputEvent: any) {
		this.loadingComplete = false;
		this.tempFile = fileInputEvent.target!.files[0]
		this.bambiService.ImageUpload(this.tempFile);
	}

	ngOnInit(): void {
		this._channelsService.imageUploadChannel.subscribe(result => { this.uploadFinished(result); });
	}

	ngOnDestroy(): void {
		this._channelsService.imageUploadChannel = new Subject<ImageChannelResult>;
	}

	uploadFinished(result: ImageChannelResult) {
		this.loadingComplete = true;
		if (result.sucess) { this.currentImage = result.b64! }
	 }
	resetImage() { this.currentImage = ''; }
	saveChanges() { this._fdService.tempImage = this.currentImage }

}
