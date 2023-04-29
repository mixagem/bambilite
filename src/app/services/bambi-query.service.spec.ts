import { TestBed } from '@angular/core/testing';

import { BambiQueryService } from './bambi-query.service';

describe('BambiQueryService', () => {
  let service: BambiQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BambiQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
