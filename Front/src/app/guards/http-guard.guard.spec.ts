import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { httpGuardGuard } from './http-guard.guard';

describe('httpGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => httpGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
