export interface ConsultarTriagemResponse {
    map(arg0: (item: any) => any): import("./consulta-historico-triagem.response").ConsultarHistoricoTriagemResponse[];

    idTriagem: string;
    dataChegada: string;
    dataSaida: string;
    orientacao:string;
    idUsuario:string;
    controleTriagem?: {
      codigo: number;
        anoBase: string;
    };
    reclamante?: {
        idPessoa: string;
        nome: string;
        cpf: string;
    };
    empresa?: {
        idPessoa: string;
        nome: string;
        cnpj: string;
    };
    tipoTriagem?: {
        idTipoTriagem: string;
        nomeTipoTriagem: string;
    }
    
}

