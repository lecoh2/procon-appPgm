export interface CadastrarAudienciaResponse {
  mensagem: string;
  dados: {
    idAta?: string;
    codigo: string | number;
    anoBase: string;
    fato: string;
    dataFinal?: string; // formato ISO (ex: '2025-07-14T00:00:00')
    hora: string;
    idReclamacao?: string;

    reclamantes: string[];
    cpfReclamantes: string[];
    reclamadas: string[];
    cnpjReclamadas: string[];
    representantes: string[];
    cpfRepresentantes: string[];

    usuario: string;
    reclamacao: string;
  }
}
