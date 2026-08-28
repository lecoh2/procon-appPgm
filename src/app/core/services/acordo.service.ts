import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AcordoResponse } from "../models/acordo/acordo-response";

  
  @Injectable({
    providedIn: 'root'
})

export class AcordoService {
    //atributos da classe
    private url = environment.apiProcon;
    private http = inject(HttpClient);
  consultar(): Observable<AcordoResponse[]> {
        return this.http.get<AcordoResponse[]>
            (`${this.url}/api/acordos/consultar-acordos`);
    }
}