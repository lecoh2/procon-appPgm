export interface ConsultarHistoricoPessoaJuridicaResponse {
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
  emailPessoa?:string;
  cnpjPessoa?: string;
  nomeUsuario?: string;
  InscricaoMunicipal?:string;
  InscricaoEstadual?:string;
}
export interface HistoricoPessoaDados {
 Nome?: string;
  Cnpj?: string;
  InscricaoMunicipal?: string;
  InscricaoEstadual?: string;
  Email?: string;
  Telefone?: string;
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
