import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightDetectionComponent } from './light-detection.component';

describe('LightDetectionComponent', () => {
  let component: LightDetectionComponent;
  let fixture: ComponentFixture<LightDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightDetectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LightDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
