import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { CadastrarReclamacaoRequest } from "../models/reclamacao/cadastar-reclamacao-request";
import { CadastrarReclamacaoResponse } from "../models/reclamacao/cadatrar-reclamacao-response";
import { HorariosDisponiveisRequest } from "../models/reclamacao/horarios-disponiveis-request";
import { HorariosDisponiveisResponse } from "../models/reclamacao/horarios-disponiveis-response";
import { ConsultarReclamacaoResponse } from "../models/reclamacao/consultar-reclamacao-response";
import { EditarReclamacaoComponent } from "../../modules/admin/components/reclamacao/editar-reclamacao/editar-reclamacao.component";
import { EditarReclamacaoRequest } from "../models/reclamacao/editar-reclamacao-request";
import { EditarReclamacaoResponse } from "../models/reclamacao/editar-reclamacao-response";
import { ConsultarReclamacaoHistoricoResponse } from "../models/reclamacao/consultar-reclamacao-historico-response";
import { PagedResult } from "../models/paginacao/paged-result";
@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class ReclamacaoService {
  //atributos
  private url = environment.apiProcon;
  private http = inject(HttpClient);

  //métodos para cadastrar reclamacao
  cadastrar(request: CadastrarReclamacaoRequest): Observable<CadastrarReclamacaoResponse> {
    return this.http.post<CadastrarReclamacaoResponse>
      (`${this.url}/api/reclamacao/cadastrar-reclamacao`, request)
  }
  editar(dto: EditarReclamacaoRequest): Observable<EditarReclamacaoResponse> {
    return this.http.put<EditarReclamacaoResponse>(
      `${this.url}/api/reclamacao/atualizar-reclamacao/${dto.idReclamacao}`,
      dto
    );
  }
  //consultar horarios disponiveis
  consultarHorariosDisponiveis(dataInicio: string, dataFim: string): Observable<HorariosDisponiveisResponse[]> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);

    return this.http.get<HorariosDisponiveisResponse[]>(`${this.url}/api/reclamacao/horarios-disponiveis`, { params });
  }

  consultarReclamacao(): Observable<ConsultarReclamacaoResponse[]> {
    return this.http.get<ConsultarReclamacaoResponse[]>
      (`${this.url}/api/reclamacao/consultar-reclamacao`);
  }
  consultarReclamacaoPorId(id: string): Observable<ConsultarReclamacaoResponse> {
    return this.http.get<ConsultarReclamacaoResponse>(
      `${this.url}/api/reclamacao/consultar-reclamacao-por-id/${id}`
    );
  }
  removerReclamante(idReclamante: string, idReclamacao: string): Observable<any> {
    return this.http.delete(`${this.url}/api/reclamacao/remover-reclamante/${idReclamante}/${idReclamacao}`);
  }
  removerReclamada(idReclamacao: string, idReclamada: string): Observable<any> {
    return this.http.delete(`${this.url}/api/reclamacao/remover-reclamada/${idReclamacao}/${idReclamada}`);
  }

  adicionarReclamante(idReclamacao: string, idReclamante: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/reclamacao/adicionar-reclamantes/${idReclamacao}/${idReclamante}`,
      null // sem corpo pois só usa params na URL
    );
  }
  adicionarReclamada(idReclamacao: string, idReclamada: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/reclamacao/adicionar-reclamada/${idReclamacao}/${idReclamada}`,
      null // sem corpo pois só usa params na URL
    );
  }

  //método para consultar o historico da da pesso fisica
  consultarHistoricoReclamacao(id: string): Observable<ConsultarReclamacaoHistoricoResponse> {
    return this.http.get<ConsultarReclamacaoHistoricoResponse>(
      `${this.url}/api/reclamacao/consultar-historico-reclamacao/${id}`
    );
  }



  //consultarReclamacaoComPaginacao(): Observable<ConsultarReclamacaoResponse[]> {
  // return this.http.get<ConsultarReclamacaoResponse[]>
  //   (`${this.url}/api/reclamacao/consultar-reclamacao`);
  //}



  consultarReclamacaoComPaginacao(pageNumber: number, pageSize: number): Observable<PagedResult<ConsultarReclamacaoResponse>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<ConsultarReclamacaoResponse>>(
      `${this.url}/api/reclamacao/consultar-reclamacao-paginacao`,
      { params }
    );
  }


    consultarReclamacaoPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/reclamacao/consultar-reclamacao-paginacao`, { params });
}
  getQuantidadeReclamacao(anoBase?: string) {
    return this.http.get<{ totalGeral: number; totalAnoAtual: number }>(
      `${this.url}/api/reclamacao/consultar-reclamacao-quantidade`,
      {
        params: anoBase ? { anoBase } : {}
      }
    );
  }
  


   getCincoUltimasReclamacao(): Observable<ConsultarReclamacaoResponse[]> {
    return this.http.get<ConsultarReclamacaoResponse[]>
      (`${this.url}/api/reclamacao/consultar-cinco-ultimas-reclamacoes`);
  }
}