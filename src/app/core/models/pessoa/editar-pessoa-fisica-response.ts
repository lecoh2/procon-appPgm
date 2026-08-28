
import { EnderecoResponse } from '../endereco/endereco-response';
import { SexoResponse } from '../sexo/sexto-response';


export interface DadosPessoa {

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

    idUsuario: string;
  }

}
export interface EditarPessoaFisicaResponse {
  mensagem: string;
  Dados: DadosPessoa;
}





