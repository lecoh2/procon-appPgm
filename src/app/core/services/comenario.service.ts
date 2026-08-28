import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment.development';

import {
  CriarComentarioRequest
} from '../models/comentario/criar-comentario-request';

import {
  CriarComentarioResponse
} from '../models/comentario/criar-comentario-response';

import {
  ApiResponse
} from '../models/respostas/api-response';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

  private readonly url =
    environment.apiProcon;

  private readonly http =
    inject(HttpClient);

  criarComentario(
    request: CriarComentarioRequest
  ): Observable<ApiResponse<CriarComentarioResponse>> {

    return this.http.post<
      ApiResponse<CriarComentarioResponse>
    >(
      `${this.url}/api/comentario/cadastrar-comentario`,
      request
    );
  }

  obterComentario(
    params: {
      tarefaId?: string | null;
      eventoId?: string | null;
    }
  ): Observable<CriarComentarioResponse[]> {

    let httpParams =
      new HttpParams();

    if (params.tarefaId) {
      httpParams =
        httpParams.set(
          'tarefaId',
          params.tarefaId
        );
    }

    if (params.eventoId) {
      httpParams =
        httpParams.set(
          'eventoId',
          params.eventoId
        );
    }

    return this.http.get<
      CriarComentarioResponse[]
    >(
      `${this.url}/api/comentario/consultar-comentarios`,
      {
        params: httpParams
      }
    );
  }
}