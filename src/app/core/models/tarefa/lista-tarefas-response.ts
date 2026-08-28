export interface ListaTarefasResponse {

  id?: string;

  descricao: string;

  quantidade: number;

  concluida?: boolean;

  dataConclusao?: Date | string | null;

}