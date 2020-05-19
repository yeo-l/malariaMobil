import { TestBed } from '@angular/core/testing';

import { DatabasService } from './databas.service';

describe('DatabasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatabasService = TestBed.get(DatabasService);
    expect(service).toBeTruthy();
  });
});
