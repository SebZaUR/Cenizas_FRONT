import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogginComponent } from './loggin.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LogginComponent', () => {
  let component: LogginComponent;
  let fixture: ComponentFixture<LogginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogginComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}) // Simula los parámetros de la ruta
          }
        }
      ],
      imports:[HttpClientTestingModule,FormsModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


