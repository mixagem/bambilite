import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type LoginChannelResult = { sucess: boolean, details?: string }

@Injectable({
	providedIn: 'root'
})

export class SubjectChannelsService {

	cookieLoginChannel: Subject<LoginChannelResult>;
	loginChannel: Subject<LoginChannelResult>;

	constructor() {
		this.cookieLoginChannel = new Subject<LoginChannelResult>;
		this.loginChannel = new Subject<LoginChannelResult>;
	}

	CookieLoginChannelFire(result: boolean, errorCode: string = ''): void {
		this.cookieLoginChannel.next({ sucess: result, details: errorCode });
		this.cookieLoginChannel.complete();
		if (result) { this.loginChannel.complete(); }
	}

	LoginChannelFire(result: boolean, errorCode: string = ''): void {
		this.loginChannel.next({ sucess: result, details: errorCode });
		if (result) { this.loginChannel.complete(); }
	}

}
