import { TestBed } from '@angular/core/testing';

import { FdService } from './fd.service';

describe('FdService', () => {
  let service: FdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
