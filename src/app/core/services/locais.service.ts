import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AcordoResponse } from "../models/acordo/acordo-response";
import { ConsultarLocaisResponse } from "../models/locais/consultar-locais-response";

  
  @Injectable({
    providedIn: 'root'
})

export class Locaiservice {
    //atributos da classe
    private url = environment.apiProcon;
    private http = inject(HttpClient);
  consultar(): Observable<ConsultarLocaisResponse[]> {
        return this.http.get<ConsultarLocaisResponse[]>
            (`${this.url}/api/locais/consultar-local`);
    }
}