import { GrupoNiveisRequest } from '../grupo-niveis/grupo-niveis-request';
import { GrupoSetoresRequest } from '../grupo-setores/grupo-setores-request';

export interface EditarUsuarioRequest {
  idPessoa: string;
  idUsuario?: string;
  login?: string;
  senha?: string;
  grupoSetores?: GrupoSetoresRequest[];
  grupoNiveis?: GrupoNiveisRequest[];
}