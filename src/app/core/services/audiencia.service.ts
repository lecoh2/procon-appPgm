import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CadastrarAudienciaRequest } from "../models/audiencia/cadastrar-audiencia-request";
import { Observable } from "rxjs";
import { ConsultarReclamacaoResponse } from "../models/reclamacao/consultar-reclamacao-response";
import { CadastrarAudienciaResponse } from "../models/audiencia/cadastrar-audiencia-response";
import { map } from 'rxjs/operators';
import { consultarAudienciaResponse } from "../models/audiencia/consultar-audiencia-response";
import { EditarAudienciaRequest } from "../models/audiencia/editar-audiencia-request";
import { EditarReclamacaoResponse } from "../models/reclamacao/editar-reclamacao-response";
import { ConsultarHistoricoAudienciaResponse } from "../models/audiencia/consultar-historico-audiencia-response";
@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class AudienciaService {
    //atributos
    private url = environment.apiProcon;
    private http = inject(HttpClient);

    //métodos para cadastrar reclamacao
    cadastrar(request: CadastrarAudienciaRequest): Observable<CadastrarAudienciaResponse> {
        return this.http.post<CadastrarAudienciaResponse>
            (`${this.url}/api/audiencia/cadastrar-audiencia`, request)
    }
    consultarCadastrarAudiencia(codigo: number, anoBase: string): Observable<ConsultarReclamacaoResponse> {
        return this.http.get<ConsultarReclamacaoResponse>(
            `${this.url}/api/audiencia/consultar-cadastrar-audiencia/${codigo}/${anoBase}`
        );
    }

    consultarCalendario(): Observable<ConsultarReclamacaoResponse[]> {
        return this.http.get<ConsultarReclamacaoResponse[]>(`${this.url}/api/reclamacao/consultar-reclamacao`);
    }

    consultarEditarAudiencia(codigo: number, anoBase: string): Observable<consultarAudienciaResponse> {
        return this.http.get<consultarAudienciaResponse>(
            `${this.url}/api/audiencia/consultar-editar-audienciapor-codigo-ano/${codigo}/${anoBase}`
        );
    }
    consultarAudiencia(): Observable<consultarAudienciaResponse[]> {
        return this.http.get<consultarAudienciaResponse[]>
            (`${this.url}/api/audiencia/consultar-audiencia`);
    }
    consultarAudienciaPorIdAta(idAta: string): Observable<consultarAudienciaResponse> {
        return this.http.get<consultarAudienciaResponse>(
            `${this.url}/api/audiencia/consultar-editar-audiencia/${idAta}`
        );
    }
    editar(dto: EditarAudienciaRequest): Observable<EditarReclamacaoResponse> {
        return this.http.put<EditarReclamacaoResponse>(
            `${this.url}/api/audiencia/atualizar-audiencia/${dto.idAta}`,
            dto
        );
    }
    //método para consultar o historico da audiencia uma conta pelo id
    consultarHistoricoPorId(id: string): Observable<ConsultarHistoricoAudienciaResponse> {
        return this.http.get<ConsultarHistoricoAudienciaResponse>(
            `${this.url}/api/audiencia/consultar-historico-audiencia/${id}`
        );
    }
getQuantidadeAudiencia(anoBase?: string) {
  return this.http.get<{ totalGeral: number; totalAnoAtual: number }>(
    `${this.url}/api/audiencia/consultar-audiencia-quantidade`,
    {
      params: anoBase ? { anoBase } : {}
    }
  );
}
   consultarcincoUltimasAudiencias(): Observable<consultarAudienciaResponse[]> {
        return this.http.get<consultarAudienciaResponse[]>
            (`${this.url}/api/audiencia/consultar-cinco-ultimas-audiencia`);
    }  
        consultarAudienciaPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/audiencia/consultar-audiencia-paginacao`, { params });
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