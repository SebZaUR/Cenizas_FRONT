import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureRoomComponent } from './configure-room.component';

describe('ConfigureRoomComponent', () => {
  let component: ConfigureRoomComponent;
  let fixture: ComponentFixture<ConfigureRoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigureRoomComponent]
    });
    fixture = TestBed.createComponent(ConfigureRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
