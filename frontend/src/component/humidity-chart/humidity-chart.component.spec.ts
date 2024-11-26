import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HumidityChartComponent } from './humidity-chart.component';

describe('TemperatureComponent', () => {
  let component: HumidityChartComponent;
  let fixture: ComponentFixture<HumidityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HumidityChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HumidityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
