export interface ConsultarHistoricoPessoaResponse {
  idHistoricoPessoa: string;
  idPessoa: string;
  idUsuario?: string | null;
  dataAlteracao: string;
  tipoAlteracao: string;
  observacoes: string;
  dadosAntes: string;
  dadosDepois: string



    dadosAntesObj?: HistoricoPessoaDados | null;
  dadosDepoisObj?: HistoricoPessoaDados | null;

nomePessoa?: string;
  cpfPessoa?: string;
  rgPessoa?:string;
  emailPessoa?:string;
  cnpjPessoa?: string;
  nomeUsuario?: string;
  nomeSexo?: string;
}
export interface HistoricoPessoaDados {
 Nome?: string;
  Cpf?: string;
  Rg?: string;
  Expeditor?: string;
  Profissao?: string;
  Email?: string;
  Telefone?: string;
  Sexo?: string;
  DTAtualizacao?: string;

  Endereco?: {
    Logradouro?: string;
    Numero?: string;
    Bairro?: string;
    Localidade?: string;
    Uf?: string;
    Cep?: string;
  };
}
