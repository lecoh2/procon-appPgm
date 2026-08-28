import { Component, inject } from '@angular/core';
import { TipoTriagemService } from '../../../../../core/services/tipo-triagem.service';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CadastrarTipoTriagemRequest } from '../../../../../core/models/tipo-triagem/cadastrar-tipo-triagem-request';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-cadastrar-triagem',
  standalone: false,
  templateUrl: './cadastrar-tipo-triagem.component.html',
  styleUrl: './cadastrar-tipo-triagem.component.css'
})

export class CadastrarTipoTriagemComponent {
  //injeção de dependencia
  private service = inject(TipoTriagemService);//classe de serviços do tipo triagem
  private builder = inject(FormBuilder)//construtor de formulario
  private router = inject(Router);//navegação de rotas

  //atributo

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  //strutura do formulario
  form = this.builder.group({
    nomeTipoTriagem: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  //função para capturar o submit

  onSubmit() {
    this.carregando = true; // ativa o loading
    this.mensagemErro = [];
    this.mensagemSucesso = [];
    const request: CadastrarTipoTriagemRequest = {
      nomeTipoTriagem: this.form.value.nomeTipoTriagem as string
    };

    this.service.criar(request).subscribe({
      next: (response) => {
        this.form.reset();
        this.mensagemErro = []; // limpa os erros anteriores
        //console.log(response);

        // Aguarda 2 segundos antes de mostrar mensagem e redirecionar
        setTimeout(() => {
          this.carregando = false; // desativa o loading
          this.mensagemSucesso = [response?.mensagem]; // só aparece depois do spinner
          this.router.navigate(['/admin/cadastrar-tipo-triagem']);
        }, 2000);

      },
      error: (e) => {
        this.mensagemErro = [];

        const errorResponse = e.error;

        if (errorResponse?.errors) {
          // Validação do ModelState
          for (const key in errorResponse.errors) {
            if (Array.isArray(errorResponse.errors[key])) {
              this.mensagemErro.push(...errorResponse.errors[key]);
            }
          }
        } else if (errorResponse?.mensagem) {
          // ApplicationException com 'Mensagem' e 'Detalhes'

          this.mensagemErro.push(errorResponse.mensagem);

          if (errorResponse.Detalhes) {

            this.mensagemErro.push(errorResponse.Detalhes);

          }
        } else if (errorResponse?.Message) {

          // Exception genérica
          this.mensagemErro.push(errorResponse.Message);

          if (errorResponse.inner) {

            this.mensagemErro.push(errorResponse.inner);

          }
        } else {

          // Fallback genérico
          this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');

        }
        this.carregando = false; // desativa o spinner em qualquer caso de erro
      }

    });
  }
}

