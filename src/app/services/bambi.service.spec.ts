import { TestBed } from '@angular/core/testing';

import { BambiService } from './bambi.service';

describe('BambiService', () => {
	let service: BambiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(BambiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
