export interface ConsultarNotificacaoResponse {
    idNotificacao?: string;
    idControleNotificacao?: string;
    idControleReclamacao?: string;
    idUsuario?: string;

    tipoNotificacao?: number;
    texto?: string;
    numeroProcesso?: string;
    anoProcesso?: string;
    codigo?: string;
    anoBase?: string;
    idReclamacao?: string;
    dataCadastro?: string;
    grupoReclamantesAtendimento: string[];
    grupoReclamantesAtendimentoCpf
    : string[];
    grupoReclamadasAtendimento
    : string[];
    grupoReclamadasAtendimentoCnpj: string[];
    grupoArtigos: string[];
}
