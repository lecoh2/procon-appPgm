import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConsultarReclamacaoResponse } from "../models/reclamacao/consultar-reclamacao-response";
import { ConsultarPaResponse } from "../models/pa/consultar-pa-response";
import { EditarPaResponse } from "../models/pa/editar-pa-response";
import { EditarPaRequest } from "../models/pa/editar-pa-request";
import { ConsultarPaHistoricoResponse } from "../models/pa/consultar-pa-historico-response";
import { CadastrarNotificacaoRequest } from "../models/notificacao/cadastrar-notificacao-request";
import { CadastrarNotificacaoResponse } from "../models/notificacao/cadastrar-notificacao-response";
import { ConsultarNotificacaoResponse } from "../models/notificacao/consultar-notificacao-response";
import { ConsultarNotificacaoHistoricoResponse } from "../models/notificacao/consultar-notificacao-historico-response";
import { EditarNotificacaoResponse } from "../models/notificacao/editar-notificacao-response";
import { EditarNotificacaoRequest } from "../models/notificacao/editar-notificacao-request";




@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class NotificacaoService {
  //atributos
  private url = environment.apiProcon;
  private http = inject(HttpClient);

  //métodos para cadastrar reclamacao
  cadastrar(request: CadastrarNotificacaoRequest): Observable<CadastrarNotificacaoResponse> {
    return this.http.post<CadastrarNotificacaoResponse>
      (`${this.url}/api/notificacaointimacao/cadastrar-notificacao-intimacao`, request)
  }
  consultarCadastrarNotificacao(codigo: number, anoBase: string): Observable<ConsultarReclamacaoResponse> {
    return this.http.get<ConsultarReclamacaoResponse>(
      `${this.url}/api/notificacaointimacao/consultar-cadastrar-notificacao-intimacao/${codigo}/${anoBase}`
    );
  }
  consultarNotificacao(): Observable<ConsultarNotificacaoResponse[]> {
    return this.http.get<ConsultarNotificacaoResponse[]>
      (`${this.url}/api/notificacaointimacao/consultar-cadastrar-notificacao-intimacao`);
  }
  editarPorId(dto: EditarNotificacaoRequest): Observable<EditarNotificacaoResponse> {
    return this.http.put<EditarNotificacaoResponse>(
      `${this.url}/api/notificacaointimacao/atualizar-notificacao-intimacao/${dto.idNotificacao}`,
      dto
    );
  }
  consultarNotificacaoPorId(id: string): Observable<ConsultarNotificacaoResponse> {
    return this.http.get<ConsultarNotificacaoResponse>(
      `${this.url}/api/notificacaointimacao/consultar-cadastrar-notificacao-intimacao-por-id/${id}`
    );
  }
    consultarHistoricoNotificacao(id: string): Observable<ConsultarNotificacaoHistoricoResponse> {
      return this.http.get<ConsultarNotificacaoHistoricoResponse>(
        `${this.url}/api/notificacaointimacao/consultar-historico-notificaco-intimacao/${id}`
      );
    }

    
    consultarNotificacaoIntimacaoPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/notificacaointimacao/consultar-notificacao-intimacao-paginacao`, { params });
}
  getQuantidadeReclamacao(anoBase?: string) {
    return this.http.get<{ totalGeral: number; totalAnoAtual: number }>(
      `${this.url}/api/reclamacao/consultar-reclamacao-quantidade`,
      {
        params: anoBase ? { anoBase } : {}
      }
    );
  }

}