export interface CadastrarAudienciaRequest {
  idUsuario?: string;
  idAcordos?: string;
  idSetores?: string;
  idReclamacao?: string;
  dataCadastro?: string; // usar string no formato ISO (ex: '2025-07-14T13:30:00')
  fato?: string;
  dataFinal?: string;     // mesma ideia, pode ser string para compatibilidade com DatePicker
  hora?: string;          // armazenado como string 'HH:mm:ss' ou 'HH:mm'
}