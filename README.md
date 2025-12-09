# Rede Social

Aplicação full-stack de rede social com autenticação, perfis de usuário, posts e sistema de curtidas/comentários.

## Stack Tecnológica

**Backend:**
- Django 5.2.9 + Django REST Framework
- Autenticação JWT (Simple JWT)
- SQLite (desenvolvimento) / PostgreSQL (produção recomendado)
- CORS configurado
- python-dotenv para variáveis de ambiente
- Validação de CPF via API externa
- Mensagens centralizadas em português

**Frontend:**
- React 19 + TypeScript
- React Router v7
- Styled Components
- Axios para requisições HTTP
- Context API (Auth + Toast)
- Custom hooks (usePostsFeed, useProfileData)
- Utilitários (date, profile, storage)

## Funcionalidades

- 🔐 Autenticação completa (registro, login, JWT com refresh automático)
- 👤 Perfis de usuário com foto de perfil
- 👥 Sistema de seguir/seguidores com modal de visualização
- ✍️ Criar, visualizar e curtir posts
- 💬 Comentários em posts
- 📱 Feed de posts com dados de autor e curtidas
- 🔔 Sistema de notificações toast profissional
- 🆔 Validação de CPF via API externa

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

## Configuração

### 1. Backend

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
```

### 2. Frontend

```powershell
cd frontend
npm install
npm start
```

**Variáveis de Ambiente** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:8000/api/
REACT_APP_MEDIA_URL=http://localhost:8000
```

## Endpoints Principais

### Autenticação
- `POST /api/accounts/auth/register/` - Registrar usuário
- `POST /api/accounts/auth/login/` - Login
- `GET /api/accounts/auth/me/` - Dados do usuário atual
- `POST /api/token/refresh/` - Atualizar token JWT

### Perfil
- `GET /api/accounts/auth/profile/?username=<user>` - Ver perfil
- `POST /api/accounts/auth/update-profile-picture/` - Atualizar foto
- `POST /api/accounts/auth/follow/` - Seguir usuário
- `POST /api/accounts/auth/unfollow/` - Deixar de seguir
- `GET /api/accounts/auth/user-followers/?username=<user>` - Ver seguidores
- `GET /api/accounts/auth/user-following/?username=<user>` - Ver seguindo

### Posts
- `GET /api/posts/` - Feed de posts
- `POST /api/posts/` - Criar post
- `GET /api/posts/user/<username>/` - Posts de um usuário
- `POST /api/posts/<id>/like/` - Curtir/descurtir post
- `POST /api/posts/<id>/comment/` - Comentar em post

## Segurança

✅ Secret key em variável de ambiente  
✅ DEBUG configurável por ambiente  
✅ CORS configurado adequadamente  
✅ ALLOWED_HOSTS protegido  
✅ Validação de upload (max 5MB, tipos JPEG/PNG/GIF/WebP)  
✅ Headers de segurança em produção  
✅ Autenticação JWT com refresh token automático  
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
