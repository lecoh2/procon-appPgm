export interface CadastrarNotificacaoResponse {
    mensagem: string;
    dados: {
        idNotificacao?: string;
        idControleNotificaca?: string;
        idControleReclamacao?: string;
        idUsuario?: string;
        tipoNotificacao?: string;
        texto?: string;
        numeroProcesso?: string;
        anoProcesso?: string;
        codigo?: string;
        anoBase?: string;
        idReclamacao?: string;
        dataCadastro?: string;
    }
}
