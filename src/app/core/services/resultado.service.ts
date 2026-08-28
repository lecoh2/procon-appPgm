import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { CadastrarTipoTriagemRequest } from "../models/tipo-triagem/cadastrar-tipo-triagem-request";
import { Observable } from "rxjs";
import { CadastraTipoTriagemResponse } from "../models/tipo-triagem/cadastrar-tipo-triagem-response";
import { ConsultarTipoTriagemResponse } from "../models/tipo-triagem/consultar-tipo-triagem-response";
import { EditarTipoTriagemRequest } from "../models/tipo-triagem/editar-tipo-triagem.request";
import { EditarTipoTriagemResponse } from "../models/tipo-triagem/edittar-tipo-triagem.response";
import { ConsultarResultadoResponse } from "../models/resultado/consultar-resultado-response";

@Injectable({
    providedIn: 'root'
})

export class ResultadoService {
    //atributos da classe
    private url = environment.apiProcon;
    private http = inject(HttpClient);
    consultar(): Observable<ConsultarResultadoResponse[]> {
        return this.http.get<ConsultarResultadoResponse[]>
            (`${this.url}/api/resultado/consultar-resultado`);
    }
}