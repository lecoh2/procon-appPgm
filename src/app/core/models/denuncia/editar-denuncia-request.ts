export interface EditarDenunciaRequest {
    idDenuncia:string;    
    idUsuario?: string;
    denuncia_Fato?: string;
    observacoes?: string;
}