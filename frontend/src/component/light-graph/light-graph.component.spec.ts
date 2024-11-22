import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightGraphComponent } from './light-graph.component';

describe('LightGraphComponent', () => {
  let component: LightGraphComponent;
  let fixture: ComponentFixture<LightGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LightGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
