import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DasboardResponse } from "../models/dashboard/dashboard.response";
import { LembreteResponse } from "../models/lembrete/lembrete-response";

@Injectable({
    providedIn: 'root'
})
export class DashboardService{
    //atributos da classe
    private url = environment.apiProcon;
    private http = inject(HttpClient);
    //metodo para consultar o dashboar

    obterDashboard(): Observable<DasboardResponse[]>{
        return this.http.get<DasboardResponse[]>
        (`${this.url}/dashboard`);
    }
      // =====================================================
  // LEMBRETES
  // =====================================================

getLembretes(): Observable<LembreteResponse[]> {
  return this.http.get<LembreteResponse[]>(
    `${this.url}/api/lembrete/lembretes`
  );
}
}