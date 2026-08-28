export interface consultarAudienciaResponse {
  idAta?: string;
  codigo: string;
  anoBase: string;
  fato: string;

  idReclamacao?: string;
  reclamantes: string[];
  cpfReclamantes: string[];
  reclamadas: string[];
  cnpjReclamadas: string[];
  representantes: string[];
  cpfRepresentantes: string[];
  grupoReclamantesAtendimento: string[];
  grupoRepresentanteAtendimentoFisico: string[];
  grupoReclamadasAtendimento: string[];
  grupoReclamantesAtendimentoCpf: string[];
  grupoRepresentanteAtendimentoJuridico: string[];
  grupoReclamadasAtendimentoCnpj: string[]
  grupoArtigos: string[];
  usuario: string;
  reclamacao: string;
  hora?: string | null;
  nomeAcordo?: string | null;
  prazo?: string | null;
  dias?: string | null;
  dataFinal?: Date | null;
  dataCadastro?: string | null;
  codigoReclamacao?: string | null;
  anoBaseReclamacao?: string | null;
  codigoAtendimento?: string | null;
  anoBaseAtendimento?: string | null;
  idAcordo?: string | null;
  IdAtendimentoStatus?:string | null;
  dataAudiencia?: string | null;
}
