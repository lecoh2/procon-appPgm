export interface EditarAudienciaRequest {
    idAta?:string;
  idUsuario?: string;
  idAcordo?: string;
  idSetores: string;
  idReclamacao?: string;
  prazo?: number;
  dataFinal?: string; // Aqui deve ser string
  hora?: string;
  dias?: number;
  fato: string;
}
