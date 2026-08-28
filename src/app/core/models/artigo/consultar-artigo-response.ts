export interface ConsultarArtigoResponse {
  idArtigo: string; // Guid no C# vira string no TS
  titulo: string;
  texto: string;
  subTitulo?: string;
}