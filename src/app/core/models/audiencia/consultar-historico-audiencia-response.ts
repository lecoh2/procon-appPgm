export interface ConsultarHistoricoAudienciaResponse{
   idHistoricoAta: string;
  idAta: string;
  idUsuario: string;
  dadosAntes: string;
  dadosDepois: string;
  dadosAntesObj?: any; // ou um tipo mais específico
  dadosDepoisObj?: any;
  usuarioNome?: string;
  nomeAcordo?: string;
  loginUsuario?: string;
  codigoAta?: string;
  anoBaseAta?: string;
  observacoes?: string;
  fato?: string;
  dataAlteracao?: string;
  dataAudiencia?: string;
  hora?: string;
  acordos?: {        // <== Inclua aqui
    idAcordo: string;
    nomeAcordo: string;
  };
}