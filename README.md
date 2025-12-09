# Rede Social - X Clone

Aplicação full-stack de rede social inspirada no X (antigo Twitter), com autenticação completa, sistema de posts, curtidas, comentários, perfis de usuário e upload de fotos.

## 🌐 Deploy

**Aplicação em Produção:**
- **Frontend**: [https://xclonebyhtferretti.vercel.app](https://xclonebyhtferretti.vercel.app)
- **Backend API**: Hospedado no Railway
- **Armazenamento de Imagens**: Cloudinary

## 🚀 Stack Tecnológica

**Backend:**
- Django 5.2.9 + Django REST Framework
- Autenticação JWT (Simple JWT)
- PostgreSQL (produção) / SQLite (desenvolvimento)
- Cloudinary para armazenamento de imagens
- Gunicorn + WhiteNoise para servir arquivos estáticos
- CORS configurado para integração com frontend
- Validação de CPF via API externa
- Mensagens centralizadas em português

**Frontend:**
- React 19 + TypeScript
- React Router v7 para navegação
- Styled Components para estilização
- Axios para requisições HTTP
- Context API (Auth + Toast)
- Custom hooks para gerenciamento de estado
- Hospedado na Vercel

**Infraestrutura:**
- **Frontend**: Vercel (deploy automático via Git)
- **Backend**: Railway (PostgreSQL + Django)
- **Mídia**: Cloudinary (armazenamento e entrega de imagens)

## ✨ Funcionalidades

### Autenticação e Perfis
- 🔐 Sistema completo de registro e login com JWT
- 🔄 Refresh automático de tokens de autenticação
- 👤 Perfis de usuário personalizáveis
- 📸 Upload e gerenciamento de foto de perfil
- ✏️ Edição de username, email e senha
- 🆔 Validação de CPF brasileiro via API externa

### Social
- 👥 Sistema de seguir/deixar de seguir usuários
- 📊 Visualização de seguidores e pessoas seguidas
- 🔍 Navegação entre perfis de usuários
- 📈 Contadores de seguidores e seguindo

### Posts e Interações
- ✍️ Criar posts com texto
- ❤️ Curtir e descurtir posts
- 💬 Sistema de comentários
- 📱 Feed personalizado com posts de usuários seguidos
- 🔄 Feed de posts curtidos
- 📋 Visualização de posts no perfil do usuário

### UX/UI
- 🎨 Interface moderna inspirada no X (Twitter)
- 🔔 Sistema de notificações toast profissional
- 📱 Design responsivo
- ⚡ Navegação fluida entre páginas
- 🖼️ Preview de imagem antes do upload
- 🗑️ Limpeza automática de imagens antigas no Cloudinary

## Estrutura do Projeto

### Backend (`/backend`)
```
accounts/          # Autenticação e perfis
  ├── models.py           # UserProfile, Follow
  ├── views.py            # AuthViewSet (register, login, profile, follow)
  ├── serializers.py      # RegisterSerializer, LoginSerializer, UserSerializer
  ├── cpf_validator.py    # Validação de CPF via API
  └── messages.py         # Mensagens centralizadas em português

posts/             # Sistema de posts
  ├── models.py           # Post, Like, Comment
  ├── views.py            # Posts, curtidas, comentários
  └── serializers.py      # PostSerializer, CommentSerializer

backend/
  └── settings.py         # Configurações com variáveis de ambiente
```

### Frontend (`/frontend/src`)
```
pages/             # Páginas principais
  ├── Auth.tsx            # Login/Registro
  ├── Home.tsx            # Feed de posts
  ├── Profile.tsx         # Perfil do usuário
  ├── EditProfile.tsx     # Editar perfil
  └── NewPost.tsx         # Criar novo post

components/        # Componentes reutilizáveis
  ├── Post.tsx            # Card de post
  ├── ActionButton.tsx    # Botão de ação
  ├── FollowModal.tsx     # Modal de seguidores/seguindo
  └── PlusButton.tsx      # Botão para novo post

context/           # Contextos React
  ├── AuthContext.tsx     # Autenticação global
  └── ToastContext.tsx    # Sistema de notificações

hooks/             # Custom hooks
  ├── usePostsFeed.ts     # Gerenciamento do feed
  └── useProfileData.ts   # Dados do perfil

utils/             # Utilitários
  ├── date.ts             # Formatação de datas
  ├── profile.ts          # Helpers de perfil
  └── storage.ts          # LocalStorage
```

## 🛠️ Desenvolvimento Local

### Backend

```powershell
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Variáveis de Ambiente** (`backend/.env`):
```env
DJANGO_SECRET_KEY=sua-chave-secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Cloudinary (opcional para desenvolvimento local)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
```

### Frontend

```powershell
cd frontend
npm install
npm start
```

**Variáveis de Ambiente** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:8000/api/
```

## 📡 API Endpoints

### Autenticação
- `POST /api/accounts/auth/register/` - Registrar novo usuário
- `POST /api/accounts/auth/login/` - Autenticar usuário
- `GET /api/accounts/auth/me/` - Dados do usuário autenticado
- `POST /api/token/refresh/` - Renovar token JWT

### Perfil de Usuário
- `GET /api/accounts/auth/profile/?username=<user>` - Visualizar perfil
- `POST /api/accounts/auth/update-profile-picture/` - Atualizar foto de perfil
- `POST /api/accounts/auth/update-username/` - Atualizar nome de usuário
- `POST /api/accounts/auth/update-email-password/` - Atualizar email/senha
- `POST /api/accounts/auth/follow/` - Seguir usuário
- `POST /api/accounts/auth/unfollow/` - Deixar de seguir usuário
- `GET /api/accounts/auth/user-followers/?username=<user>` - Listar seguidores
- `GET /api/accounts/auth/user-following/?username=<user>` - Listar seguindo

### Posts
- `GET /api/posts/` - Feed de posts (usuários seguidos)
- `POST /api/posts/` - Criar novo post
- `GET /api/posts/user/<username>/` - Posts de um usuário específico
- `GET /api/posts/liked/` - Posts curtidos pelo usuário
- `POST /api/posts/<id>/like/` - Curtir/descurtir post
- `GET /api/posts/<id>/comments/` - Listar comentários de um post
- `POST /api/posts/<id>/comment/` - Adicionar comentário

## 🔒 Segurança

✅ Autenticação JWT com refresh automático  
✅ Secret key protegida em variáveis de ambiente  
✅ CORS configurado para produção  
✅ ALLOWED_HOSTS restrito  
✅ Validação de uploads (max 5MB, apenas imagens)  
✅ Headers de segurança HTTPS em produção  
✅ Sanitização de inputs do usuário  
✅ Proteção contra CSRF  
✅ Limpeza automática de arquivos não utilizados  

## 📦 Tecnologias de Deploy

### Vercel (Frontend)
- Deploy automático via integração Git
- Variáveis de ambiente configuradas no dashboard
- CDN global para performance
- HTTPS automático

### Railway (Backend)
- PostgreSQL gerenciado
- Deploy automático via Git
- Variáveis de ambiente seguras
- Logs em tempo real
- Custom start command para migrations

### Cloudinary (Mídia)
- Armazenamento de imagens na nuvem
- CDN global para entrega rápida
- Transformação de imagens automática
- Cleanup automático de imagens antigas via Django signals
- 25GB gratuitos no plano free

## 👨‍💻 Autor

Desenvolvido por **htferretti**

---

**Nota**: Este projeto foi desenvolvido como uma aplicação full-stack de demonstração, implementando as principais funcionalidades de uma rede social moderna.  
✅ Validação de CPF via API externa  
✅ Proteção CSRF habilitada  

## Deploy para Produção

### Pré-requisitos
1. Gerar nova `DJANGO_SECRET_KEY` segura
2. Configurar `DEBUG=False`
3. Configurar banco PostgreSQL (`DATABASE_URL`)
4. Atualizar `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS` com domínio real
5. Configurar armazenamento de mídia (AWS S3 ou similar)
6. Habilitar HTTPS/SSL

### Plataformas Recomendadas
- **Backend:** Railway, Render, AWS EC2
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront

### Variáveis de Ambiente - Produção

**Backend:**
```env
DJANGO_SECRET_KEY=<nova-chave-segura-256-bits>
DEBUG=False
ALLOWED_HOSTS=seudominio.com
CORS_ALLOWED_ORIGINS=https://seudominio.com
DATABASE_URL=postgresql://user:pass@host:5432/db
```

**Frontend:**
```env
REACT_APP_API_URL=https://api.seudominio.com/api/
REACT_APP_MEDIA_URL=https://api.seudominio.com
```
