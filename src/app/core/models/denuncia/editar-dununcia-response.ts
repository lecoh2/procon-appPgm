export interface EditarDenunciaResponse {

    mensagem: string;
    Dados: {
        idAtendimento: string;
        codigo?: string;
        anoBase?: string;
        idControleDenuncia?: string;
        denuncia_fato?: string;
        protocolo?: string;
        reclamantes: string[];
        cpfReclamantes: string[];
        reclamadas: string[];
        cnpjReclamadas: string[];

        usuario?: string;
    }
}
