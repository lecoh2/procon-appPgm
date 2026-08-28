export interface EditarAudienciaResponse {
    mensagem: string;
    Dados: {
        idUsuario?: string;
        idAcordos?: string;
        codigo?: number;
        anoBase?: string;
        dataAtualizacao?: Date;
        hora?: string; // formato "HH:mm" ou "HH:mm:ss"
    }
}
