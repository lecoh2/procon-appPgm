
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConsultarArtigoResponse } from "../models/artigo/consultar-artigo-response";
import { CadastrarArtigoRequest } from "../models/artigo/cadastrar-artigo-request";
import { CadastrarArtigoResponse } from "../models/artigo/cadastrar-artigo-response";
import { EditarArtigoRequest } from "../models/artigo/editar-artigo-request";
import { EditarArtigoResponse } from "../models/artigo/editar-artigo-response";


@Injectable({
    providedIn: 'root'
})

export class ArtigoService {
    //atributos da classe
    private url = environment.apiProcon;
    private http = inject(HttpClient);

    cadastrar(request: CadastrarArtigoRequest): Observable<CadastrarArtigoResponse> {
        return this.http.post<CadastrarArtigoResponse>
            (`${this.url}/api/artigo/cadastrar`, request)
    }
    consultarArtigo(): Observable<ConsultarArtigoResponse[]> {
        return this.http.get<ConsultarArtigoResponse[]>
            (`${this.url}/api/artigo/consultar-artigo`);
    }
    editarPorId(dto: EditarArtigoRequest): Observable<EditarArtigoResponse> {
        return this.http.put<EditarArtigoResponse>(
            `${this.url}/api/artigo/atualizar-artigo/${dto.idArtigo}`,
            dto
        );
    }
    consultarArtigoPorId(id: string): Observable<ConsultarArtigoResponse> {
        return this.http.get<ConsultarArtigoResponse>(
            `${this.url}/api/artigo/consultar-artigo-por-id/${id}`
        );
    }
    buscarPorArtigo(titulo: string): Observable<ConsultarArtigoResponse[]> {
        return this.http.get<ConsultarArtigoResponse[]>
            (`${this.url}/api/artigo/consultar-artigo/${encodeURIComponent(titulo)}`);
    }

}
