import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ArtigoService } from '../../../../../core/services/artigo.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment.development';
import { EditarArtigoRequest } from '../../../../../core/models/artigo/editar-artigo-request';

@Component({
  selector: 'app-editar-artigo',
  standalone: false,
  templateUrl: './editar-artigo.component.html',
  styleUrl: './editar-artigo.component.css'
})
export class EditarArtigoComponent {
  // --- Injeção de dependências via inject()

  private artigoService = inject(ArtigoService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  form = this.builder.group({
    idArtigo: ['', Validators.required],
    titulo: ['', Validators.required],
    texto: ['', Validators.required],
    subTitulo: ['', Validators.required],

  });




  ngOnInit(): void {

    // Captura o ID da rota
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.carregando = false;
      return;
    }

    this.artigoService.consultarArtigoPorId(id).subscribe({
      next: response => {
        console.log("Dados recebidos:", response);
        const artigo = Array.isArray(response) ? response[0] : response;

        // ✅ Preenche campos do formulário
        this.form.patchValue({
          idArtigo: artigo.idArtigo,
          titulo: artigo.titulo,
          subTitulo: artigo.subTitulo,
          texto: artigo.texto,
        });

        this.carregando = false;
      },
      error: err => {
        this.tratarErro(err);
        this.carregando = false;
      }
    });
  }

  get podeEnviar(): boolean {
    return !!this.form.get('idArtigo')?.valid &&
      !!this.form.get('titulo')?.valid &&
      !!this.form.get('texto')?.valid &&
      !!this.form.get('subTitulo')?.valid;
  }
  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (!this.podeEnviar) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregando = false;
      return;
    }

    // ✅ Chama o método separado que faz o envio
    this.enviarEdicaoArtigo();
  }

  private enviarEdicaoArtigo() {
    const request: EditarArtigoRequest = {
      idArtigo: this.form.value.idArtigo!,
      titulo: this.form.value.titulo!,
      subTitulo: this.form.value.subTitulo!,
      texto: this.form.value.texto!
    };

    this.artigoService.editarPorId(request).subscribe({
      next: (response) => {
        this.mensagemSucesso = [response?.mensagem || 'Processo Administrativo atualizado com sucesso!'];
        this.carregando = false;
        this.cd.detectChanges();
        setTimeout(() => this.router.navigate(['/admin/consultar-artigo']), 3000);
      },
      error: (e) => {
        this.tratarErro(e);
        this.carregando = false;
      }
    });
  }

  private tratarErro(e: any) {
    const errorResponse = e.error;
    this.mensagemErro = [];

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        if (Array.isArray(errorResponse.errors[key])) {
          this.mensagemErro.push(...errorResponse.errors[key]);
        }
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
      if (errorResponse.Detalhes) {
        this.mensagemErro.push(errorResponse.Detalhes);
      }
    } else if (errorResponse?.Message) {
      this.mensagemErro.push(errorResponse.Message);
      if (errorResponse.inner) {
        this.mensagemErro.push(errorResponse.inner);
      }
    } else {
      this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');
    }
  }
}
