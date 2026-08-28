import { GrupoReclamantesAtendimentoRequest } from '../grupo-reclamantes-atendimentos/grupo-reclamantes-atendimento-request';
import { GrupoReclamadasAtendimentoRequest } from '../grupo-reclamadas-atendimento/grupo-reclamadas-atendimento-request';
import { GrupoRepresentanteAtendimentoFisicoRequest } from '../grupo-representante-atendimento-fisico/grupo-representante-atendimento-fisico-request';
import { GrupoRepresentantesAtendimentoJuridicoRequest } from '../grupo-representante-atendimento-juridico/grupo-representante-atendimento-juridico-request';
import { GrupoArtigoAtendimentoRequest } from '../grupo-artigo-atendimento/grupo-artigo-atendimento-request';
import { GrupoReclamantesAtendimentoPJRequest } from '../grupo-reclamantespj-atendimentos/grupo-reclamantes-atendimento-pj-request';
export interface CadastrarAtendimentoRequest {
  idUsuario?: string;
  idResultado?: string;
  fato?: string;
  telefone?: string;
  protocolo?: string;
 prazo?: number;
  GrupoReclamantesAtendimentoRequest: GrupoReclamantesAtendimentoRequest[];
   GrupoReclamantesAtendimentoPJRequest: GrupoReclamantesAtendimentoPJRequest[];
  GrupoReclamadasAtendimentoRequest: GrupoReclamadasAtendimentoRequest[];
  GrupoRepresentantesAtendimentoFisicoRequest: GrupoRepresentanteAtendimentoFisicoRequest[];
  GrupoRepresentantesAtendimentoJuridicoRequest: GrupoRepresentantesAtendimentoJuridicoRequest[];
  GrupoArtigoAtendimentoRequest: GrupoArtigoAtendimentoRequest[];
}
