import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolInvitationsWidgetComponent } from './pool-invitations-widget.component';

describe('PoolInvitationsWidgetComponent', () => {
  let component: PoolInvitationsWidgetComponent;
  let fixture: ComponentFixture<PoolInvitationsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoolInvitationsWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolInvitationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
