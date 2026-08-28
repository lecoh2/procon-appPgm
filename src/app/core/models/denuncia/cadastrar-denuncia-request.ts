
import { GrupoArtigoDenunciaRequest } from "../grupo-artigo-denuncia/grupo-artigo-denuncia-request";
import { GrupoReclamadasDenunciaRequest } from "../grupo-reclamadas-denuncia/grupo-reclamadas-denuncia-request";
import { GrupoReclamantesDenunciaRequest } from "../grupo-reclamantes-denuncia/grupo-reclamantes-denuncia-request";

export interface CadastrarDenunciaRequest {
    idUsuario?: string;
    denuncia_Fato?: string;
    GrupoReclamantesDenunciaRequest: GrupoReclamantesDenunciaRequest[];
    GrupoReclamadasDenunciaRequest: GrupoReclamadasDenunciaRequest[];
    GrupoArtigoDenunciaRequest: GrupoArtigoDenunciaRequest[];
}