export interface CadastrarAtendimentoResponse {
  mensagem: string;
  dados: {
    idAtendimento?: string;
    idUsuario?: string;
    idResultado?: string;
    codigo?: string;
    anoBase?: string;
    // idControle?: string;
    fato?: string;
    dataCadastro?: Date;
    protocolo?: string;
    reclamantes: string[];
    cpfReclamantes: string[];
    reclamadas: string[];
    cnpjReclamadas: string[];
    telefonesReclamantesAtendimento: string[];
    telefonesReclamadasAtendimento: string[];
    usuario?: string;
    nomeResultado?: string;
  }
}