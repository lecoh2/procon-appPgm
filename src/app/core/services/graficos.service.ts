import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ReclamacaoAgrupadaResponse } from '../models/reclamacao/reclamacao-agrupada.response';
import { AtendimentoAgrupadoResponse } from '../models/atendimento/atendimento-agrupado-response';
import { AudienciaAgrupadaResponse } from '../models/audiencia/audiencia-agrupada-response';
import { PaAgrupadoResponse } from '../models/pa/PaAgrupadoResponse';
import { NotificaoAgrupadaResponse } from '../models/notificacao/notificacao-agrupada-response';
import { UsuariosAgrupadosResponse } from '../models/usuario/usuarios-agrupados-response';

export interface GraficoResponse {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

@Injectable({ providedIn: 'root' })
export class GraficosService {
  private url = environment.apiProcon;
  private http = inject(HttpClient);


  getGraficoBarra(): Observable<ReclamacaoAgrupadaResponse[]> {
    return this.http.get<ReclamacaoAgrupadaResponse[]>(`${this.url}/api/reclamacao/consultar-graficos-barra-reclamacao`);
  }
 getGraficoReclamacaoPizza(): Observable<ReclamacaoAgrupadaResponse[]> {
    return this.http.get<ReclamacaoAgrupadaResponse[]>(`${this.url}/api/reclamacao/consultar-graficos-barra-reclamacao`);
  }
  getGraficoAtendimento(): Observable<AtendimentoAgrupadoResponse[]> {
    return this.http.get<AtendimentoAgrupadoResponse[]>(`${this.url}/api/atendimento/consultar-graficos-atendimento`);
  }
  getGraficoAudiencia(): Observable<AudienciaAgrupadaResponse[]> {
    return this.http.get<AudienciaAgrupadaResponse[]>(`${this.url}/api/audiencia/consultar-graficos-audiencia`);
  }
   getGraficoPaBarra(): Observable<PaAgrupadoResponse[]> {
    return this.http.get<PaAgrupadoResponse[]>(`${this.url}/api/paadmin/consultar-graficos-barra-pa`);
  }
     getGraficoNotificacao(): Observable<NotificaoAgrupadaResponse[]> {
    return this.http.get<NotificaoAgrupadaResponse[]>(`${this.url}/api/notificacaointimacao/consultar-graficos-notificacao`);
  }
   getGraficoUsurioAtendimento(): Observable<UsuariosAgrupadosResponse[]> {
        return this.http.get<UsuariosAgrupadosResponse[]>(`${this.url}/api/usuario/consultar-graficos-atendimento-usuarios`);
    }
 getGraficoUsurioAtendimentoAnual(): Observable<UsuariosAgrupadosResponse[]> {
        return this.http.get<UsuariosAgrupadosResponse[]>(`${this.url}/api/usuario/consultar-graficos-atendimento-usuarios-porano`);
    }
    
}
