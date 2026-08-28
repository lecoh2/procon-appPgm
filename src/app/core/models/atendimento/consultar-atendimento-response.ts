import { ArtigoSimplesRequest } from "../artigo/artigo-simples-request";

export interface ConsultarAtendimentoResponse {
  idAtendimento?: string;
  idControleAtendimento?: string;
  codigo?: string;
  anoBase?: string;
  dataCadastro?: string;

  // Reclamantes
  reclamantes: string[];
  cpfReclamantes: string[];
  idUsuario?: string;
  // Reclamadas
  reclamadas: string[];
  cnpjReclamadas: string[];
  usuario?: string;
  nomeUsuario?: string;
  protocolo?: string;
  fato?: string;
  observacoes?: string;
  usuarioCadastro?: string;
prazo?: string | null;
nomeStatus?:string | null,
  dias?: string | null;
  idAtendimentoStatus?: string;
  grupoReclamantesAtendimento: string[];
  grupoReclamantesAtendimentoCpf: string[];
  grupoReclamadasAtendimento: string[];
  grupoReclamadasAtendimentoCnpj: string[];


  // Reclamantes
  grupoReclamantesAtendimentoSimples: string[];
  grupoReclamantesAtendimentoSimplesCpf: string[];

  // Reclamadas
  grupoReclamadasAtendimentoSimples: string[];
  grupoReclamadasAtendimentoSimplesCnpj: string[];



  grupoRepresentanteAtendimentoFisicoSimples: string[];
  grupoRepresentanteAtendimentoFisicoSimplessCpf: string[];

  grupoRepresentanteAtendimentoFisico: string[];

  grupoRepresentanteAtendimentoJuridicaSimples: string[];
  grupoRepresentanteAtendimentoJuridicaSimplesCnpj: string[];
  grupoRepresentanteAtendimentoJuridica: string[];
  grupoArtigosSimples: string[];
  grupoArtigos: string[];



}