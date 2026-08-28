import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { KanbanColuna } from "../models/kanban/kanban-coluna";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class KanbanService {
    private url = environment.apiProcon;
    private http = inject(HttpClient);

    consultar(): Observable<KanbanColuna[]> {
        return this.http.get<KanbanColuna[]>
            (`${this.url}/api/kanban/consultar-kanban`);
    }
    obterDetalhes(id: string, tipo: string) {
        return this.http.get<any>(
            `${this.url}/api/detalheatividade/${id}/detalhes/${tipo}`

      
        );
    }
    atualizarStatus(id: string, status: number) {
        return this.http.put(
            `${this.url}/api/kanban/kanban/${id}/status`,
            status
        );
    }
}