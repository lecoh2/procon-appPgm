import { Component, inject } from '@angular/core';
import { ArtigoService } from '../../../../../core/services/artigo.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment.development';
import { CadastrarArtigoRequest } from '../../../../../core/models/artigo/cadastrar-artigo-request';

@Component({
  selector: 'app-cadastrar-artigo',
  standalone: false,
  templateUrl: './cadastrar-artigo.component.html',
  styleUrl: './cadastrar-artigo.component.css'
})
export class CadastrarArtigoComponent {
  // --- Injeção de dependências via inject()
  private artigoService = inject(ArtigoService);
  private builder = inject(FormBuilder);
  private router = inject(Router);

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiProcon;
  titulo?: string = '';
  texto?: string = '';
  subTitulo?: string = '';

  // --- FormGroup
  form = this.builder.group({
    titulo: ['', Validators.required],
    texto: ['', Validators.required],
    subTitulo: ['', Validators.required],
  });

  // validação para habilitar submit — exige PF e PJ pelo seu requisito original
  get podeEnviar(): boolean {
    return !!this.form.get('titulo')?.valid &&
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
    const request: CadastrarArtigoRequest = {
      titulo: this.form.value.titulo!,
      texto: this.form.value.texto!,
      subTitulo: this.form.value.subTitulo!,
    };

    console.log('Objeto request enviado:', request);

    this.artigoService.cadastrar(request).subscribe({
      next: (response) => {
        this.form.patchValue({
          titulo: '',
          texto: '',
          subTitulo: '',
        });

        setTimeout(() => {
          this.carregando = false;
          this.mensagemSucesso = [response?.mensagem || 'Artigo cadastrado com sucesso!'];
          this.router.navigate(['/admin/cadastrar-artigo']);
        }, 2000);
      },
      error: (e) => {
        this.tratarErro(e);
        this.carregando = false;
      }
    });

  }
  private tratarErro(e: any) {
    const errorResponse = e?.error;
    this.mensagemErro = [];

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        if (Array.isArray(errorResponse.errors[key])) {
          this.mensagemErro.push(...errorResponse.errors[key]);
        }
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
      if (errorResponse.Detalhes) this.mensagemErro.push(errorResponse.Detalhes);
    } else if (errorResponse?.Message) {
      this.mensagemErro.push(errorResponse.Message);
      if (errorResponse.inner) this.mensagemErro.push(errorResponse.inner);
    } else {
      this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');
    }
  }
}
