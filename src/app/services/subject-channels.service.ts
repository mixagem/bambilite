import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type LoginChannelResult = { sucess: boolean, details?: string }
export type ImageChannelResult = { sucess: boolean, b64?: string, details?: string }

@Injectable({ providedIn: 'root' })

export class SubjectChannelsService {

	cookieLoginChannel: Subject<LoginChannelResult>;
	loginChannel: Subject<LoginChannelResult>;
	imageUploadChannel: Subject<ImageChannelResult>;

	constructor() {
		this.cookieLoginChannel = new Subject<LoginChannelResult>;
		this.loginChannel = new Subject<LoginChannelResult>;
		this.imageUploadChannel = new Subject<ImageChannelResult>;
	};

	CookieLoginChannelFire(result: boolean, errorCode: string = ''): void {
		this.cookieLoginChannel.next({ sucess: result, details: errorCode });
		this.cookieLoginChannel.complete();
		if (result) { this.loginChannel.complete() };
	};

	LoginChannelFire(result: boolean, errorCode: string = ''): void {
		this.loginChannel.next({ sucess: result, details: errorCode });
		if (result) { this.loginChannel.complete(); this.cookieLoginChannel.complete() };
	};

	ImageUploadChannelFire(result: boolean, imageB64: string, errorCode: string = ''): void {
		this.imageUploadChannel.next({ sucess: result, b64: imageB64, details: errorCode });
	};

}
