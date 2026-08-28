import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { CadastrarTipoTriagemRequest } from "../models/tipo-triagem/cadastrar-tipo-triagem-request";
import { Observable } from "rxjs";
import { CadastraTipoTriagemResponse } from "../models/tipo-triagem/cadastrar-tipo-triagem-response";
import { ConsultarTipoTriagemResponse } from "../models/tipo-triagem/consultar-tipo-triagem-response";
import { EditarTipoTriagemRequest } from "../models/tipo-triagem/editar-tipo-triagem.request";
import { EditarTipoTriagemResponse } from "../models/tipo-triagem/edittar-tipo-triagem.response";
@Injectable({
    providedIn: 'root'
})

export class TipoTriagemService {
    //atributos da classe
    private url = environment.apiProcon;
    private http = inject(HttpClient);

    //metetodo para criar um tipo de triagem

    criar(request: CadastrarTipoTriagemRequest): Observable<CadastraTipoTriagemResponse> {
        return this.http.post<CadastraTipoTriagemResponse>
            (`${this.url}/api/tipotriagem/cadastrar-tipo-triagem`, request);
    }
    consultar(): Observable<ConsultarTipoTriagemResponse[]> {
        return this.http.get<ConsultarTipoTriagemResponse[]>
            (`${this.url}/api/tipotriagem/consultar-tipo-triagem`);
    }
    //método para consultar uma conta pelo id
    consultarPorId(id: string): Observable<ConsultarTipoTriagemResponse> {
        return this.http.get<ConsultarTipoTriagemResponse>(
            `${this.url}/api/tipotriagem/consultar-tipo-triagem-por-id/${id}`
        );
    }
    //método para atualizar contas na API
    editar(dto: EditarTipoTriagemRequest): Observable<EditarTipoTriagemResponse> {
        return this.http.put<EditarTipoTriagemResponse>(
            `${this.url}/api/tipotriagem/atualizar/${dto.idTipoTriagem}`, // 👍 Claro e padrão
            dto
        );
    }
    //método para excluir contas na Api
    atualizarStatus(id: string): Observable<any> {
        return this.http.put<any>(
            `${this.url}/api/tipotriagem/excluir/${id}`,
            {} // corpo vazio
        );
    }


}


