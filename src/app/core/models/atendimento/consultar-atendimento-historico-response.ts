export interface ConsultarAtendimentoHistoricoResponse {
  idHistoricoAtendimento: string;
  idAtendimento: string;
  idUsuario: string;

  dataAlteracao: string;
  tipoAlteracao: string;
  observacoes: string;
  dadosAntes: string;
  dadosDepois: string;
  dadosAntesObj?: any; // ou um tipo mais específico
  dadosDepoisObj?: any;
  nomeUsuario: string;
  emailUsuario: string;
  codigo:string;
  anoBase:string;
}