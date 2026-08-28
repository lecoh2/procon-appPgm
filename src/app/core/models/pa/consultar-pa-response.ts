

export interface ConsultarPaResponse {
    idPa?: string;
    paNumero?: string;
    ano?: string;
    idUsuario?: string;
    idLocais?: string;
    idReclamacao?: string;
    dataCadastro?: string;
    status?: string;
    usuario?: string;
    codigo?: string;
    anoBase?: string;
    nomeLocais?: string;
    usuarioNome?: string;
     grupoReclamantesAtendimento: string[];
  grupoReclamantesAtendimentoCpf
  : string[];
  grupoReclamadasAtendimento
  : string[];
  grupoReclamadasAtendimentoCnpj: string[];
  grupoArtigos: string[];
}