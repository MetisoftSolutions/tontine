import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantListWidgetComponent } from './participant-list-widget.component';

describe('ParticipantListWidgetComponent', () => {
  let component: ParticipantListWidgetComponent;
  let fixture: ComponentFixture<ParticipantListWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantListWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantListWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
