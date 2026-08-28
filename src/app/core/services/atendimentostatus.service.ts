import { inject, Injectable } from "@angular/core";
import { ConsultarAtendimentoStatusResponse } from "../models/atendimentoStatus/consulta-atendimento-status-response";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AtendimentoStatusService {
    //atributos
    private url = environment.apiProcon;
    private http = inject(HttpClient);

    ConsultarStatusAtendimento(): Observable<ConsultarAtendimentoStatusResponse[]> {
        return this.http.get<ConsultarAtendimentoStatusResponse[]>
            (`${this.url}/api/atendimentostatus/consultar-atendimento-status`);

    }
}