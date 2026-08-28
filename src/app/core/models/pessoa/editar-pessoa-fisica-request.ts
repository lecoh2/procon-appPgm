export interface EditarPessoaFisicaRequest {
  idPessoa?: string;
  nome?: string;
  profissao?: string;
  rg?: string;
  expeditor?: string;
  cpf?: string;
  dtAlteracao?: Date;
  telefone?: string;
  email?: string;
  idSexo?: string;
  observacoes?: string;
  idUsuario?: string;

  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    localidade: string;
    uf: string;
    cep: string;
  };
}
