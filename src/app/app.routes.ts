import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/notfound/notfound.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login', //domínio
        //Lazy loading do modulo de login
        //O Angular vai carregar o módulo de login apenass
        //quando o usúario acessar a rota /login
        loadChildren: () => import('./modules/login/login.module')
            .then(m => m.LoginModule)
    }, {
        path: 'admin', //domínio
        //Lazy loading do modulo de admin
        //O Angular vai carregar o módulo de admin apenas
        //quando o usúario acessar a rota /admin
        loadChildren: () => import('./modules/admin/admin.module')
            .then(m => m.AdminModule),
        //aplicar o guardião para  não permitr acesso de usuarios autenticados
        canActivate: [AuthGuard]
    },
    {
        path: '', //raiz do projeto
        pathMatch: 'full',
        redirectTo: '/login/autenticar-usuario'
        //redireciona para a toda de login
    },
    {
        path: '**', //caminho comprompido
        component: NotFoundComponent//caminho de erro 404
    }
];
