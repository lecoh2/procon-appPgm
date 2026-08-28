export interface ControleReclamacao {
  idControleReclamacao?: string;
  codigo?: number;
  anoBase?: string;
  dataCadastro?: Date;
  // Se quiser incluir a navegação reversa:
  // triagens?: Triagem[];
}