import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchAccountWidgetComponent } from './switch-account-widget.component';

describe('SwitchAccountWidgetComponent', () => {
  let component: SwitchAccountWidgetComponent;
  let fixture: ComponentFixture<SwitchAccountWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitchAccountWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchAccountWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
