export interface CadastrarArtigoResponse {
    mensagem: string;
    dados: {
        idArtigo?: string;
        titulo?: string;
        texto?: string;
        subTitulo?: string;
    }
}