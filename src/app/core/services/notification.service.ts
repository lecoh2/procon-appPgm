import { inject, Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { Notificacao } from '../models/notficacao/notificacao';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private url =
    environment.apiProcon;

  private http =
    inject(HttpClient);

  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {}
    );
  }

  // =====================================================
  // CONSULTAR NOTIFICAÇÕES
  // =====================================================

  getNotificacoes(
    usuarioId: string
  ): Observable<Notificacao[]> {

    return this.http.get<Notificacao[]>(
      `${this.url}/api/notificacoes/${usuarioId}`,
      {
        headers:
          this.getHeaders()
      }
    );
  }

  // =====================================================
  // MARCAR COMO LIDA
  // =====================================================

  marcarComoLida(
    id: string
  ): Observable<void> {

    return this.http.put<void>(
      `${this.url}/api/notificacoes/marcar-lida/${id}`,
      {},
      {
        headers:
          this.getHeaders()
      }
    );
  }
}