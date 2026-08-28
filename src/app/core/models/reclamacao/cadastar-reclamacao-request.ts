import { GrupoReclamadasRequest } from "../grupo-reclamadas/grupo-reclamadas-request";
import { GrupoReclamantesRequest } from "../grupo-reclamantes/grupo-reclamantes.request";
import { RepresentantesRequest } from "../representantes/representantes.request";


export interface CadastrarReclamacaoRequest {
  idUsuario?: string;
  idAtendimento?:string;
  descricao?: string;
  dataAudiencia?: string;
  hora?: string; // TimeSpan em C# deve ser string no front, ex: "14:30:00"

GrupoReclamadasRequestDto: GrupoReclamadasRequest[];
  GrupoReclamantesRequestDto: GrupoReclamantesRequest[];
  representantesRequestDto: RepresentantesRequest[];
}
