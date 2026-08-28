export interface LembreteResponse {
  id: string;

  titulo: string;

  data: string;

  tipo: string;

  categoria: string;

  recorrente: boolean;

  diaInteiro: boolean;
   responsaveis: string[];
}