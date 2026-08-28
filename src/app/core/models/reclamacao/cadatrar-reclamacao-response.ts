import { EditarPessoaFisicaRequest } from "../pessoa/editar-pessoa-fisica-request";

export interface CadastrarReclamacaoResponse {
  mensagem: string;
  dados: {
    idReclamacao: string;
    codigo?: string | number;
    anoBase?: string;
    idControleReclamacao?: string;
    descricao?: string;
    dataAudiencia?: Date;
    hora?: string;

    reclamantes: string[];
    cpfReclamantes: string[];
    reclamadas: string[];
    cnpjReclamadas: string[];

    usuario?: string;

    reclamantesSimples?: EditarPessoaFisicaRequest[];
    reclamadasSimples?: EditarPessoaFisicaRequest[];
  }
}
