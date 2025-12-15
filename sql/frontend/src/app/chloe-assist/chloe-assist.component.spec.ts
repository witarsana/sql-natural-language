import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChloeAssistComponent } from './chloe-assist.component';

describe('ChloeAssistComponent', () => {
  let component: ChloeAssistComponent;
  let fixture: ComponentFixture<ChloeAssistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChloeAssistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChloeAssistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
