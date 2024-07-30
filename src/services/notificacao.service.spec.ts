/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NotificacaoService } from './notificacao.service';

describe('Service: Notificacao', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificacaoService]
    });
  });

  it('should ...', inject([NotificacaoService], (service: NotificacaoService) => {
    expect(service).toBeTruthy();
  }));
});
