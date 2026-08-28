export interface CadastrarPaResponse {
  mensagem: string;
  dados: {
    idPa?: string;
    paNumero?: string;
    ano?: string;
    idUsuario?: string;
    idLocais?: string;
    idReclamacao?: string;
    status?: string;
  }
}
