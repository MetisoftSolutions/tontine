import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningPoolsWidgetComponent } from './running-pools-widget.component';

describe('RunningPoolsWidgetComponent', () => {
  let component: RunningPoolsWidgetComponent;
  let fixture: ComponentFixture<RunningPoolsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunningPoolsWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunningPoolsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
