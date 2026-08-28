import { EnderecoResponse } from '../endereco/endereco-response';



export interface DadosPessoa {

  mensagem: string;
  Dados: {
    idPessoa: string;
    nome?: string;
    profissao?: string;
    cnpj?: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;   
    endereco?: EnderecoResponse;
    idUsuario: string;
  }

}
export interface EditarPessoaJuridicaResponse {
  mensagem: string;
  Dados: DadosPessoa;
}
