import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { HistoricoGeralResponse } from '../models/historico-geral/historico-geral-response';
import { TipoEntidadeEnum } from '../models/enums/tipo-entidade/tipo-entidadeEnum';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {

  private url = environment.apiProcon;
  private http = inject(HttpClient);


  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    );
  }


  // =====================================================
  // CONSULTAR HISTÓRICO
  // =====================================================

ConsultarHistorico(
  entidade: TipoEntidadeEnum,
  entidadeId: string
): Observable<HistoricoGeralResponse[]> {

  return this.http.get<HistoricoGeralResponse[]>(
    `${this.url}/api/historicogeral/historico/${entidade}/${entidadeId}`,
    {
      headers: this.getHeaders()
    }
  );
}
}