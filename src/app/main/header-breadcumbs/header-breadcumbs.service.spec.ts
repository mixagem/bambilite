import { TestBed } from '@angular/core/testing';

import { HeaderBreadcumbsService } from './header-breadcumbs.service';

describe('HeaderBreadcumbsService', () => {
  let service: HeaderBreadcumbsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderBreadcumbsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
