export interface CriarListaTarefaRequest {

  descricao: string;

  concluida?: boolean;

  dataConclusao?: Date | string | null;

}