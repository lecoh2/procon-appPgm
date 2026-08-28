export interface EditarAtendimentoRequest {
  idAtendimento: string;
  idUsuario?: string;
  fato?: string;
  dataAtualizacao?: string;
  protocolo?: string;
  observacoes?: string;
  prazo?: number;
  idAtendimentoStatus?:string;

  
}