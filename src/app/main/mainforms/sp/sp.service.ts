
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IListSupplement, IDetailsSupplement } from 'src/app/interfaces/Sp';

export type SupplementChannelResult = { sucess: boolean, supplements?: IListSupplement[], supplement?: IDetailsSupplement, details?: string }

@Injectable({ providedIn: 'root' })

export class SpService {

	// drawer status control
	drawerOpen: boolean = false;
	// drawer animations control
	drawerFadeout: boolean = false;

	supplementListChannel: Subject<SupplementChannelResult>;
	supplementDetailsChannel: Subject<SupplementChannelResult>;
	supplementUpdateChannel: Subject<SupplementChannelResult>;
	supplementDeleteChannel: Subject<SupplementChannelResult>;

	constructor() {
		this.supplementListChannel = new Subject<SupplementChannelResult>;
		this.supplementDetailsChannel = new Subject<SupplementChannelResult>;
		this.supplementUpdateChannel = new Subject<SupplementChannelResult>;
		this.supplementDeleteChannel = new Subject<SupplementChannelResult>;
	}


	SupplementListChannelFire(result: boolean, errorCode: string = '', supplementList?: IListSupplement[],): void {
		this.supplementListChannel.next({ sucess: result, supplements: supplementList, details: errorCode });
	}

	SupplementDetailsChannelFire(result: boolean, errorCode: string = '', supplementDetails?: IDetailsSupplement): void {
		this.supplementDetailsChannel.next({ sucess: result, supplement: supplementDetails, details: errorCode });
	}

	SupplementUpdateChannelFire(result: boolean, errorCode: string = ''): void {
		this.supplementUpdateChannel.next({ sucess: result, details: errorCode });
	}

	SupplementDeleteChannelFire(result: boolean, code: string): void {
		this.supplementDeleteChannel.next({ sucess: result, details: code });
	}

	GetPriceByRatio(price: number, unitvalue: number, unit: string): number {

		let ajustedPriced = 0;

		if (isNaN(price)) { return ajustedPriced }

		switch (unit) {
			case 'L': case 'kg':
				ajustedPriced = price / unitvalue
				break;
			case 'ml': case 'g':
				ajustedPriced = (1000 * price / unitvalue)
				break;
		}

		return Number(ajustedPriced.toFixed(3));

	}

	GetPriceByQuantity(price: number, unitvalue: number, unit: string): number {

		let ajustedPriced = 0;

		if (isNaN(price)) { return ajustedPriced }

		switch (unit) {
			case 'L': case 'kg':
				ajustedPriced = unitvalue * price
				break;
			case 'ml': case 'g':
				ajustedPriced = unitvalue / 1000 * price
				break;
		}

		return Number(ajustedPriced.toFixed(3));

	}

	GetKcalBy100(kcal: number, unitvalue: number, unit: string): number {

		let ajustedKcals = 0;

		if (isNaN(kcal)) { return ajustedKcals }

		switch (unit) {
			case 'L': case 'kg':
				ajustedKcals = kcal / unitvalue / 10
				break;
			case 'ml': case 'g':
				ajustedKcals = kcal / unitvalue * 100
				break;
		}

		return Number(ajustedKcals.toFixed(3));
	}

	GetKcal(kcalby100: number, unitvalue: number, unit: string): number {

		let ajustedKcals = 0;

		if (isNaN(kcalby100)) { return ajustedKcals }

		switch (unit) {
			case 'L': case 'kg':
				ajustedKcals = kcalby100 * 10 * unitvalue
				break;
			case 'ml': case 'g':
				ajustedKcals = kcalby100 / 100 * unitvalue
				break;
		}

		return Number(ajustedKcals.toFixed(3));
	}
}
