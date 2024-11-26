import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightChartComponent } from './light-chart.component';

describe('LightDetectionComponent', () => {
  let component: LightChartComponent;
  let fixture: ComponentFixture<LightChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LightChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
