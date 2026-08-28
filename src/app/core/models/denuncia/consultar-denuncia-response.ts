export interface ConsultarDenunciaResponse {
  idDenuncia?: string;
  codigo: string;
  anoBase: string;
  denuncia_Fato: string;
  idControleDenuncia: string;
  idUsuario: string;
  reclamantes: string[];
  cpfReclamantes: string[];
  reclamadas: string[];
  cnpjReclamadas: string[];
  nomeUsuario: string;
  observacoes: string;
  grupoReclamantesDenuncia: string[];
  grupoReclamadasDenuncia: string[];
  grupoReclamantesDenunciaCpf: string[];
  grupoReclamadasDenunciaCnpj: string[];
  grupoArtigosDenuncia: string[];
  usuario: string;
  dataCadastro?: string;
  codigoDenuncia?: string | null;
  anoBaseDenuncia?: string | null;

}
