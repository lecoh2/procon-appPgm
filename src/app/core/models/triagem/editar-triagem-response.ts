export interface ControleTriagemResponse {
  codigo: number;
  anoBase: string;
}

export interface DadosTriagem {
  idTriagem: string;
  orientacao: string;
  idPessoa: string;
  idEmpresa: string;
  idUsuario: string;
  idTipoTriagem: string;
  controleTriagem?: ControleTriagemResponse; // adiciona aqui
}

export interface EditarTriagemResponse {
  mensagem: string;
  Dados: DadosTriagem;
}