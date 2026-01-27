# Upload de Imagens de Usuários

## Problema Identificado

As imagens de perfil dos usuários estavam sendo salvas fisicamente no servidor backend (`/backend/public/images/user-images/`), e o caminho estava sendo armazenado corretamente no banco de dados. Porém, as imagens não estavam acessíveis via HTTP porque faltavam duas configurações:

1. **Backend**: Servidor Express não estava configurado para servir arquivos estáticos
2. **Frontend**: Nginx não estava fazendo proxy das imagens de usuários para o backend

## Solução Implementada

### 1. Backend - Express Static Files

Adicionado middleware no `backend/src/main.js` para servir arquivos estáticos:

```javascript
// Servir arquivos estáticos (imagens de usuários, etc.)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
```

Agora as imagens são acessíveis em: `http://backend:3001/images/user-images/1234567890.png`

### 2. Frontend - Nginx Proxy

Configurado o Nginx (produção e desenvolvimento) para fazer proxy das imagens de usuários:

```nginx
# Imagens de usuários (proxy para backend)
location /images/user-images/ {
    proxy_pass http://backend:3001/images/user-images/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Como Funciona

### Fluxo de Upload

1. **Frontend**: Usuário seleciona uma imagem no modal de avatar
2. **Frontend**: Imagem é cropada e convertida para PNG
3. **Frontend**: Arquivo é enviado via FormData para `PUT /api/profiles/:userId/avatar`
4. **Backend**: Multer recebe o arquivo na memória (memory storage)
5. **Backend**: `uploadImage()` salva o arquivo em `/backend/public/images/user-images/`
6. **Backend**: Retorna o caminho relativo: `/images/user-images/1234567890.png`
7. **Backend**: Atualiza `users.profile_image` no banco com o caminho
8. **Frontend**: Recarrega o perfil e exibe a nova imagem

### Fluxo de Exibição

1. **Frontend**: Renderiza `<img src="/images/user-images/1234567890.png" />`
2. **Nginx**: Intercepta a requisição `/images/user-images/...`
3. **Nginx**: Faz proxy para `http://backend:3001/images/user-images/...`
4. **Express**: Middleware `express.static` serve o arquivo
5. **Browser**: Exibe a imagem

## Estrutura de Arquivos

```
backend/
  └── public/
      └── images/
          └── user-images/
              └── 1234567890.png  <-- Imagens salvas aqui
```

## Validações e Limites

- **Tipos permitidos**: PNG, JPG, JPEG
- **Tamanho máximo**: 5MB
- **Nome do arquivo**: Timestamp único (ex: `1769462251852.png`)
- **Storage**: Multer memory storage → fs.writeFileSync

## Sobre Armazenamento Local vs Cloud

### Armazenamento Local (Solução Atual) ✅

**Vantagens:**
- Simples de implementar e manter
- Sem custos adicionais
- Backup junto com o resto da aplicação
- Latência zero (mesmo servidor)
- Total controle sobre os dados

**Para 1000 usuários:**
- ~1000 imagens × 500KB (média) = ~500MB
- Totalmente gerenciável
- Backup fácil via rsync/scripts

**Desvantagens:**
- Escalabilidade limitada (não é um problema para 1000 usuários)
- Requer backup manual
- Não há CDN (mas não é necessário para baixo tráfego)

### Cloud Storage (S3, Cloudinary, etc.)

**Quando considerar:**
- Mais de 10.000 usuários
- Múltiplos servidores (load balancing)
- Necessidade de CDN global
- Processamento de imagens (redimensionamento, otimização)
- Backup automático e replicação

**Para este projeto:** Não é necessário. Armazenamento local é a escolha certa.

## Segurança

### Implementado ✅

- Validação de tipo de arquivo (apenas PNG/JPG)
- Limite de tamanho (5MB)
- Autenticação via JWT (apenas dono pode alterar)
- Middleware `verifyProfileOwnership`
- Nomes únicos com timestamp (evita conflitos e sobrescrita)

### Recomendações Futuras

- [ ] Sanitização de nome de arquivo original
- [ ] Verificação de tipo MIME real (não apenas extensão)
- [ ] Rate limiting para uploads
- [ ] Antivírus scan (para sistemas críticos)

## Backup

### Estratégia Recomendada

```bash
# Backup diário das imagens de usuários
rsync -avz /backend/public/images/user-images/ /backup/user-images-$(date +%Y%m%d)/

# Ou usar o script existente de backup do Google Drive
# já incluir a pasta de imagens
```

## Deleção de Imagens Antigas

O sistema já deleta automaticamente a imagem antiga quando:
- Usuário faz upload de nova imagem custom
- Usuário seleciona avatar padrão

**Exceções (não deleta):**
- Avatares padrão (bio.png, cmp.png, etc.)
- Imagens de teste (test_)

## Troubleshooting

### Imagem não aparece

1. **Verificar se foi salva:**
   ```bash
   ls -la backend/public/images/user-images/
   ```

2. **Verificar logs do backend:**
   - Procurar por `🟢 [imageUpload] Imagem salva com sucesso`
   - Procurar por `🔴 [imageUpload] Erro ao salvar arquivo`

3. **Verificar caminho no banco:**
   ```sql
   SELECT id, name, profile_image FROM users WHERE id = ?;
   ```

4. **Testar acesso direto:**
   ```bash
   curl http://localhost:3001/images/user-images/1234567890.png
   ```

5. **Verificar Nginx:**
   ```bash
   docker-compose logs frontend | grep images
   ```

### Imagem salva mas não exibida

- Verificar se o Express static middleware está ativo
- Verificar configuração do Nginx (proxy_pass)
- Verificar permissões da pasta (chmod 755)
- Limpar cache do browser (Ctrl+Shift+R)

## Performance

Para 1000 usuários:
- **Espaço em disco**: ~500MB (aceitável)
- **Latência**: <10ms (mesmo servidor)
- **Cache**: Nginx cache + browser cache (1 ano)
- **Tráfego**: Baixo (imagens servidas com cache agressivo)

## Próximos Passos (Opcional)

Se o sistema crescer muito:
- [ ] Implementar CDN (Cloudflare)
- [ ] Migrar para S3/Cloudinary
- [ ] Processamento de imagens (thumbnails, otimização)
- [ ] Suporte para WebP
- [ ] Lazy loading no frontend
