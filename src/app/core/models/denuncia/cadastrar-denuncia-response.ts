

export interface CadastrarDenunciaResponse {
  mensagem: string;
  dados: {
    idDenuncia?: string;
    codigo: string | number;
    anoBase: string;
    fato_Denuncia: string;


    reclamantes: string[];
    cpfReclamantes: string[];
    reclamadas: string[];
    cnpjReclamadas: string[];
    usuario: string;

  }
}
