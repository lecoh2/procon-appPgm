export interface EditarAtendimentoResponse {
    mensagem: string;
    Dados: {
        idAtendimento: string;
        codigo?: string;
        anoBase?: string;
        idControlAtendimento?: string;
        fato?: string;
        protocolo?: string;
        reclamantes: string[];
        cpfReclamantes: string[];
        reclamadas: string[];
        cnpjReclamadas: string[];

        usuario?: string;
    }
}
