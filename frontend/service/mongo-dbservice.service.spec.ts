import { TestBed } from '@angular/core/testing';

import { MongoDBServiceService } from './mongo-dbservice.service';

describe('MongoDBServiceService', () => {
  let service: MongoDBServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MongoDBServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
