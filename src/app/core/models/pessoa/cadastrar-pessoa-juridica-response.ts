import { EnderecoResponse } from "../endereco/endereco-response";

export interface CadastrarPessoaJuridicaResponse {
    mensagem: string;
    Dados: {
        IdPessoa: string;
        Nome: string;
        Cnpj: string;
        InscricaoEstadual: string;
        InscricaoMunicipal: string;

        Telefone: string;
        Email: string;

        endereco?: EnderecoResponse;
    }
}