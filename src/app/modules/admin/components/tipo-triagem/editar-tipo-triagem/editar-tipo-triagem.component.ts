import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { TipoTriagemService } from '../../../../../core/services/tipo-triagem.service';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EditarTipoTriagemResponse } from '../../../../../core/models/tipo-triagem/edittar-tipo-triagem.response';
import { SharedModule } from '../../../../../shared/shared.module';
import { EditarTipoTriagemRequest } from '../../../../../core/models/tipo-triagem/editar-tipo-triagem.request';


@Component({
  selector: 'app-editarr-triagem',
  standalone: false,
  templateUrl: './editar-tipo-triagem.component.html',
  styleUrl: './editar-tipo-triagem.component.css'
})

export class EditarTipoTriagemComponent {
  consulta: EditarTipoTriagemResponse[] = [];
  //injeção de dependencia
  private service = inject(TipoTriagemService);//classe de serviços do tipo triagem
  private builder = inject(FormBuilder)//construtor de formulario
  private router = inject(Router);//navegação de rotas
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  //atributo
  idTipoTriagem: string = '';
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  //strutura do formulario
  form = this.builder.group({
    nomeTipoTriagem: new FormControl('', [Validators.required, Validators.minLength(4)])
  });
  ngOnInit(): void {
    this.carregando = true;

    const id = this.route.snapshot.paramMap.get('id'); 

    if (id) {
      this.idTipoTriagem = id;

      this.service.consultarPorId(id).subscribe({
        next: (response) => {
          console.log('Dados recebidos da API:', response);
          this.form.patchValue({
            nomeTipoTriagem: response.nomeTipoTriagem
          });
          console.log('Formulário preenchido com:', this.form.value);
          this.carregando = false;
        },
        error: () => {
          this.mensagemErro = ['Erro ao carregar os dados para edição.'];
          this.carregando = false;
        }
      });
    } else {
      this.mensagemErro = ['ID do tipo de triagem não foi informado.'];
      this.carregando = false;
    }
  }

  //função para capturar o submit

  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const request: EditarTipoTriagemRequest = {
      idTipoTriagem: this.idTipoTriagem,
      nomeTipoTriagem: this.form.value.nomeTipoTriagem as string
    };

    this.service.editar(request).subscribe({
      next: (response) => {
        this.form.reset();
        this.mensagemErro = [];

        this.mensagemSucesso = [response?.mensagem ?? 'Tipo de triagem atualizado com sucesso.'];
        this.carregando = false; // <-- Mostra a mensagem imediatamente

        // Agora espera 3 segundos COM A MENSAGEM VISÍVEL e só depois redireciona
        setTimeout(() => {
          this.router.navigate(['/admin/consultar-tipo-triagem']);
        }, 3000);
      },
      error: (e) => {
        this.mensagemErro = [];
        const errorResponse = e.error;

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

        this.carregando = false;
      }
    });
  }
}