import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { CadastrarPaResponse } from "../models/pa/cadastar-pa-response";
import { CadastrarPaRequest } from "../models/pa/cadastar-pa-request";
import { ConsultarReclamacaoResponse } from "../models/reclamacao/consultar-reclamacao-response";
import { ConsultarPaResponse } from "../models/pa/consultar-pa-response";
import { EditarPaResponse } from "../models/pa/editar-pa-response";
import { EditarPaRequest } from "../models/pa/editar-pa-request";
import { ConsultarPaHistoricoResponse } from "../models/pa/consultar-pa-historico-response";




@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class PaService {
  //atributos
  private url = environment.apiProcon;
  private http = inject(HttpClient);

  //métodos para cadastrar reclamacao
  cadastrar(request: CadastrarPaRequest): Observable<CadastrarPaResponse> {
    return this.http.post<CadastrarPaResponse>
      (`${this.url}/api/paadmin/cadastrar-paadmin`, request)
  }
  consultarCadastrarAudiencia(codigo: number, anoBase: string): Observable<ConsultarReclamacaoResponse> {
    return this.http.get<ConsultarReclamacaoResponse>(
      `${this.url}/api/paadmin/consultar-cadastrar-pa/${codigo}/${anoBase}`
    );
  }
  consultarPaAdmin(): Observable<ConsultarPaResponse[]> {
    return this.http.get<ConsultarPaResponse[]>
      (`${this.url}/api/paadmin/consultar-paadmin`);
  }
  editarPorId(dto: EditarPaRequest): Observable<EditarPaResponse> {
    return this.http.put<EditarPaResponse>(
      `${this.url}/api/paadmin/atualizar-paadmin/${dto.idPa}`,
      dto
    );
  }
  consultarParId(id: string): Observable<ConsultarPaResponse> {
    return this.http.get<ConsultarPaResponse>(
      `${this.url}/api/paadmin/consultar-pa-por-id/${id}`
    );
  }
    consultarHistoricoPa(id: string): Observable<ConsultarPaHistoricoResponse> {
      return this.http.get<ConsultarPaHistoricoResponse>(
        `${this.url}/api/paadmin/consultar-historico-paadmin/${id}`
      );
    }

}