export interface ConsultarReclamacaoResponse {
  idReclamacao?: string;
  idAtendimento?: string;
  codigo?: string;
  anoBase?: string;
  codigoAtendimento?: string;
  anoBaseAtendimento?: string;
  idControleReclamacao?: string;
  descricao?: string;
  dataAudiencia?: string; // ou Date, dependendo de como você trata datas
  hora?: string;
  dataReclamacao?: string;
  dataAtendimento?: string;
  reclamantes: string[];
  cpfReclamantes: string[];
  reclamadas: string[];
  cnpjReclamadas: string[];
  grupoReclamantesAtendimento: string[];
  grupoReclamantesAtendimentoCpf: string[];
  grupoReclamadasAtendimento: string[];
  grupoReclamadasAtendimentoCnpj: string[];
  grupoRepresentanteAtendimentoFisico: string[];
  grupoRepresentanteAtendimentoJuridica: string[];
  grupoArtigos: string[];
  representantes?: string[];
  cnpjRepresentantes?: string[];
  usuario?: string;
  usuarioAtendimento?: string;
  titulo?: string;
  jaVirouAudiencia?: boolean;
}