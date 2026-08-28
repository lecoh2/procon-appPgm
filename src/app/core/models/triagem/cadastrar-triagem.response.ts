export interface CadastrarTriagemResponse {
    mensagem: string;
    Dados: {
        DataChegada: string;
        Orientacao: string;
        IdPessoa: string;
        IdEmpresa: string;
        IdUsuario: string;
        IdTipoTriagem: string;
    }
}