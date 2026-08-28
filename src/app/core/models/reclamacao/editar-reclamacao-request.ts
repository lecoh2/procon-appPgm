export interface EditarReclamacaoRequest {
  idReclamacao: string;
  idAtendimento?: string;
  idUsuario?: string;
  descricao?: string;
  dataAudiencia?: string;
  dataAtualizacao?: string;
  hora?: string; // TimeSpan em C# deve ser string no front, ex: "14:30:00",
  observacoes?: string;
}