import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { CadastrarTriagemRequest } from "../models/triagem/cadastrar-triagem.request";
import { Observable } from "rxjs";
import { CadastrarTriagemResponse } from "../models/triagem/cadastrar-triagem.response";
import { ConsultarTriagemResponse } from "../models/triagem/consulta-triagem-response";
import { EditarTriagemRequest } from "../models/triagem/editar-triagem-request";
import { EditarTriagemResponse } from "../models/triagem/editar-triagem-response";
@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class TriagemService {
    //atributos
    private url = environment.apiProcon;
    private http = inject(HttpClient);

    //metodo para cadastrar a triagem
    cadastrar(request: CadastrarTriagemRequest): Observable<CadastrarTriagemResponse> {
        return this.http.post<CadastrarTriagemResponse>
            (`${this.url}/api/triagem/cadastrar-triagem`, request);
    }
    consultar(): Observable<ConsultarTriagemResponse[]> {
        return this.http.get<ConsultarTriagemResponse[]>
            (`${this.url}/api/triagem/consultar-triagens`);
    }
    //método para consultar uma conta pelo id
    consultarPorId(id: string): Observable<ConsultarTriagemResponse> {
        return this.http.get<ConsultarTriagemResponse>(
            `${this.url}/api/triagem/consultar-triagem-por-id/${id}`
        );
    }
    //método para atualizar contas na API
    editar(dto: EditarTriagemRequest): Observable<EditarTriagemResponse> {
        return this.http.put<EditarTriagemResponse>(
            `${this.url}/api/triagem/atualizar-triagem/${dto.idTriagem}`,

            dto
        );
    }
    //método para consultar o historico da triagem uma conta pelo id
    consultarHistoricoPorId(id: string): Observable<ConsultarTriagemResponse> {
        return this.http.get<ConsultarTriagemResponse>(
            `${this.url}/api/triagem/consultar-historico/${id}`
        );
    }


}