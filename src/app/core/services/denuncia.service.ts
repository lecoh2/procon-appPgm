import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { ConsultarAtendimentoResponse } from "../models/atendimento/consultar-atendimento-response";
import { PagedResult } from "../models/paginacao/paged-result";
import { EditarAtendimentoRequest } from "../models/atendimento/editar-atendimento-request";
import { EditarAtendimentoResponse } from "../models/atendimento/editar-atendimento-response";
import { ConsultarAtendimentoHistoricoResponse } from "../models/atendimento/consultar-atendimento-historico-response";
import { CadastrarDenunciaRequest } from "../models/denuncia/cadastrar-denuncia-request";
import { CadastrarDenunciaResponse } from "../models/denuncia/cadastrar-denuncia-response";
import { ConsultarDenunciaResponse } from "../models/denuncia/consultar-denuncia-response";
import { EditarDenunciaRequest } from "../models/denuncia/editar-denuncia-request";
import { EditarDenunciaResponse } from "../models/denuncia/editar-dununcia-response";
import { ConsultarHistoricoAudienciaResponse } from "../models/audiencia/consultar-historico-audiencia-response";

@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class DenunciaService {
  //atributos
  private url = environment.apiProcon;
  private http = inject(HttpClient);

  //métodos para cadastrar reclamacao
  cadastrar(request: CadastrarDenunciaRequest): Observable<CadastrarDenunciaResponse> {
    return this.http.post<CadastrarDenunciaResponse>
      (`${this.url}/api/denuncia/cadastrar-denuncia`, request)
  }
  consultarDenunciaComPaginacao(): Observable<PagedResult<ConsultarDenunciaResponse>> {
    return this.http.get<PagedResult<ConsultarDenunciaResponse>>(
      `${this.url}/api/denuncia/consultar-denuncia-paginacao`
    );
  }

consultarDenunciaPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/denuncia/consultar-denuncia-paginacao`, { params });
}





  consultarDenuncia(): Observable<ConsultarDenunciaResponse[]> {
    return this.http.get<ConsultarDenunciaResponse[]>
      (`${this.url}/api/denuncia/consultar-denuncias`);
  }

 consultarDenunciaPorId(id: string): Observable<ConsultarDenunciaResponse> {
  return this.http.get<ConsultarDenunciaResponse>(`${this.url}/api/denuncia/consultar-denuncia-por-id/${id}`);
}


  editarPorId(dto: EditarDenunciaRequest): Observable<EditarDenunciaResponse> {
    return this.http.put<EditarDenunciaResponse>(
     `${this.url}/api/denuncia/atualizar-denuncia/${dto.idDenuncia}`,
    dto
    );
 }

  removerclamadaDenuncia(idReclamada: string, idDenuncia: string): Observable<any> {
    return this.http.delete(`${this.url}/api/denuncia/remover-reclamada-denuncia/${idReclamada}/${idDenuncia}`);
  }
  removerReclamanteDenuncia(idReclamante: string, idDenuncia: string): Observable<any> {
    return this.http.delete(`${this.url}/api/denuncia/remover-reclamante-denuncia/${idReclamante}/${idDenuncia}`);
  }
  adicionarReclamanteDenuncia(idDenuncia: string, idReclamante: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/denuncia/adicionar-reclamante-denuncia/${idDenuncia}/${idReclamante}`,
      null // sem corpo pois só usa params na URL
    );
  }
  adicionarReclamadaDenuncia(idDenuncia: string, idReclamada: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/denuncia/adicionar-reclamada-denuncia/${idDenuncia}/${idReclamada}`,
      null // sem corpo pois só usa params na URL
    );
  }
  adicionarArtigosDenuncia(idDenuncia: string, idArtigo: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/denuncia/adicionar-grupo-artigo-denuncia/${idDenuncia}/${idArtigo}`,
      null // sem corpo pois só usa params na URL
    );
  }
  removerArtigosDenuncia(idArtigo: string, idDenuncia: string): Observable<any> {
    return this.http.delete(`${this.url}/api/denuncia/remover-grupo-artigo-atendimento/${idArtigo}/${idDenuncia}`);
  }

  

  consultarHistoricoDenuncia(id: string): Observable<ConsultarHistoricoAudienciaResponse> {
    return this.http.get<ConsultarHistoricoAudienciaResponse>(
      `${this.url}/api/denuncia/consultar-historico/${id}`
    );
  }
 

getQuantidadeDenuncia(anoBase?: string) {
  return this.http.get<{ totalGeral: number; totalAnoAtual: number }>(
    `${this.url}/api//consultar-atendimento-quantidade`,
    {
      params: anoBase ? { anoBase } : {}
    }
  );
}

 ConsultarCincoUltimosDenuncia(): Observable<ConsultarAtendimentoResponse[]> {
    return this.http.get<ConsultarAtendimentoResponse[]>
      (`${this.url}/api//consultar-cinco-ultimas-atendimentos`);
  }

}
