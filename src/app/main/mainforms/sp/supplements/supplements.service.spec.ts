import { TestBed } from '@angular/core/testing';

import { SupplementsService } from './supplements.service';

describe('SupplementsService', () => {
  let service: SupplementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
