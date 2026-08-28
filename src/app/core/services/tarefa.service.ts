import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";

import { Observable } from "rxjs";
import { ApiResponse } from "../models/respostas/api-response";

import { CadastrarTarefaRequest } from "../models/tarefa/cadastrar-tarefa.resquest";
import { ListaTarefasResponse } from "../models/tarefa/lista-tarefas-response";
import { CadastrarTareResponse } from "../models/tarefa/cadastrar-tarefa-response";
import { ObterTarefaResponse } from "../models/tarefa/obter-tarefa-response";


@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class TarefaService {
  //atributos
  private url = environment.apiProcon;
  private http = inject(HttpClient);

  cadastrarTarefa(request: CadastrarTarefaRequest): Observable<ApiResponse<CadastrarTareResponse>> {
    const token = localStorage.getItem('token');

    return this.http.post<ApiResponse<CadastrarTareResponse>>(
      `${this.url}/api/tarefa/cadastrar-tarefa`,
      request,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    );
  }
  consultarListaTarefaAutoComplete(termo?: string) {
    const params: any = {};

    if (termo) {
      params.termo = termo;
    }

    return this.http.get<ListaTarefasResponse[]>(
      `${this.url}/api/tarefa/consultar-lista-tarefa-autocomplete`,
      { params }
    );
  }
ObterTarefaPorId(id: string): Observable<ObterTarefaResponse> {
  return this.http.get<ObterTarefaResponse>(
    `${this.url}/api/tarefa/obter-tarefa-por-id/${id}`

    
  );
}
editarTarefa(id: string, request: any): Observable<any> {
  const token = localStorage.getItem('token');

  return this.http.put<any>(
    `${this.url}/api/tarefa/atualizar-tarefa/${id}`,
    request,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
  );
}
       consultarTarefaPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/tarefa/consultar-tarefa-paginacao`, { params });
}
}