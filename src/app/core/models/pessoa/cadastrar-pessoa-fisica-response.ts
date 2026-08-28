
import { EnderecoResponse } from '../endereco/endereco-response';
import { SexoResponse } from '../sexo/sexto-response';

export interface CadastrarPessoaFisicaResponse {
  mensagem: string;
  Dados: {
    idPessoa: string;
    nome?: string;
    profissao?: string;
    rg?: string;
    expeditor?: string;
    cpf?: string;
    email?: string;
    // Relacionamentos
    sexo?: SexoResponse;
    endereco?: EnderecoResponse;
  }

}
