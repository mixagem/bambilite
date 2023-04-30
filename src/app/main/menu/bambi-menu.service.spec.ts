import { TestBed } from '@angular/core/testing';

import { BambiMenuService } from './bambi-menu.service';

describe('BambiMenuService', () => {
  let service: BambiMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BambiMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
