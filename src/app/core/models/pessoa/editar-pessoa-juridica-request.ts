export interface EditarPessoaJuridicaRequest {
  idPessoa: string;
  nome: string;
  cnpj: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  email: string;
  telefone: string;
  observacoes: string;
  idUsuario: string;
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
