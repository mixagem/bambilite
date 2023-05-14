import { TestBed } from '@angular/core/testing';

import { RecipeMaterialDetailsService } from './recipe-material-details.service';

describe('RecipeMaterialDetailsService', () => {
  let service: RecipeMaterialDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeMaterialDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
