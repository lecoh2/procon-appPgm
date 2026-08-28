import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { AccessService } from '../../../../core/services/access.service';
import { AuthHelper } from '../../../../core/helpers/auth.helper';

@Component({
  selector: 'app-siderbar',
  standalone: false,
  templateUrl: './siderbar.component.html',
  styleUrl: './siderbar.component.css'
})
export class SiderbarComponent implements OnInit {

  private authHelper = inject(AuthHelper);

  nomeUsuario: string = '';
  usuarioLogado: any = null;

  constructor(
    public access: AccessService
  ) { }

  ngOnInit(): void {

    this.usuarioLogado =
      this.authHelper.get();

    this.nomeUsuario =
      this.usuarioLogado?.nomeUsuario ??
      'Usuário';
  }

  logout(): void {

    const confirmar =
      confirm(
        `Deseja realmente sair do sistema, ${this.nomeUsuario}?`
      );

    if (!confirmar) {
      return;
    }

    this.authHelper.remove();

    location.reload();
  }
}