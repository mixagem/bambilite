import { TestBed } from '@angular/core/testing';

import { SubjectChannelsService } from './subject-channels.service';

describe('SubjectChannelsService', () => {
	let service: SubjectChannelsService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SubjectChannelsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
