import { TestBed } from '@angular/core/testing';

import { PathRedirectGuard } from './path-redirect.guard';

describe('PathRedirectGuard', () => {
  let guard: PathRedirectGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PathRedirectGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
