export interface CadastrarPessoaFisicaRequest {
  nome?: string;
  profissao?: string;
  rg?: string;
  expeditor?: string;
  cpf?: string;
  dtCadastro?: Date;
  telefone?: string;
  email?: string;
  idSexo?: string;

  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  cep?: string;
}
