export interface CadastrarPessoaJuridicaRequest {
 nome?: string;
  telefone?: string;
  email?: string;

  cnpj?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;

  // Endereço (mesma estrutura usada em Pessoa Física)
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  cep?: string;
}
