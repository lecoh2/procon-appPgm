export interface ConsultarHistoricoTriagemResponse {
  IdHistoricoTriagem: string;
  IdTriagem: string;
  IdPessoa: string;
  IdEmpresa: string;
  IdUsuario: string;
  IdTipoTriagem: string;
  DataAtualizacao: string;
  Orientacao: string;
  Observacoes: string;

  DadosAntes: string;
  DadosDepois: string;

  DadosAntesObj?: HistoricoTriagemDados;
  DadosDepoisObj?: HistoricoTriagemDados;

  reclamanteNome?: string;
  reclamanteCpf?: string;
  reclamadaNome?: string;
  reclamadaCnpj?: string;
  usuarioNome?: string;
  nomeUsuario?:string;
  nomeTipoTriagem?: string;
}

export interface HistoricoTriagemDados {
  Orientacao?: string;
  Pessoa?: {
    idPessoa: string;
    nome: string;
    cpf?: string;
  } | null;
  Empresa?: {
    idPessoa: string;
    nome: string;
    cnpj?: string;
  } | null;
  Usuario?: {
    idUsuario: string;
    login: string;
    nomeUsuario:string;
  } | null;
  tipoTriagem?: {
  idTipoTriagem: string;
  nomeTipoTriagem: string;
};
  DataAtualizacao?: string;
  ControleTriagem?: {
    Codigo?: string;
    AnoBase?: string;
  } | null;
}
