import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurtainSwitchComponent } from './curtain-switch.component';

describe('CurtainSwitchComponent', () => {
  let component: CurtainSwitchComponent;
  let fixture: ComponentFixture<CurtainSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurtainSwitchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurtainSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
