export interface EditarReclamacaoResponse {
    mensagem: string;
    Dados: {
        idReclamacao: string;
        codigo?: string;
        anoBase?: string;
        idControleReclamacao?: string;
        descricao?: string;
        dataAudiencia?: Date;
        hora?: string;

        reclamantes: string[];
        cpfReclamantes: string[];
        reclamadas: string[];
        cnpjReclamadas: string[];

        usuario?: string;
    }
}
