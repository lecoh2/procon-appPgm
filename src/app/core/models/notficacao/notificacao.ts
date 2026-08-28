export interface Notificacao {
  id: string;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  dataCriacao: string;

  tipo?: string;
  link?: string;
  entidadeId?: string;
}