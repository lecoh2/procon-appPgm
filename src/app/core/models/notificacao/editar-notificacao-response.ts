export interface EditarNotificacaoResponse {
    mensagem: string;
    dados: {
        idControleNotificacao?: string;
        numeroProcesso?: string;
        anoProcesso?: string;
        texot?:string;       
        idUsuario?: string;
        tipoNotificacao?: number;
        idReclamacao?: string;
    }
}
