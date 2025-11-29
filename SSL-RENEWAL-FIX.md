# 🔧 Correção de Renovação Automática de Certificados SSL

Este guia resolve o problema de certificados SSL expirando sem renovação automática.

## 🔴 Problema Identificado

Seu site está usando certificados autoassinados porque:
1. O certbot renovava os certificados em `/etc/letsencrypt/` do VPS
2. Os certificados não eram copiados para a pasta `ssl/` do projeto
3. O container do frontend não tinha acesso aos novos certificados
4. Os hooks do certbot não estavam sendo executados corretamente

## ✅ Solução Implementada

### Mudanças Realizadas:

1. **Script `copy-ssl-certs.sh` melhorado**:
   - Usa caminhos absolutos (não depende do diretório atual)
   - Adiciona logs detalhados com data/hora
   - Verifica validade dos certificados após cópia
   - Cria diretório de destino se não existir

2. **Script `certbot-renewal-hook.sh` melhorado**:
   - Adiciona logs em arquivo permanente
   - Reinicia o container do frontend automaticamente
   - Tratamento de erros melhorado

3. **Docker Compose corrigido**:
   - Container certbot agora monta `/etc/letsencrypt` do HOST
   - Removido hook inline que não funcionava
   - Hook será executado pelo sistema (não pelo container)

4. **Novo script `fix-ssl-renewal.sh`**:
   - Diagnostica todo o sistema SSL
   - Aplica todas as correções necessárias
   - Configura hooks e cronjobs
   - Renova certificados se necessário

## 📋 Instruções de Instalação no VPS

### Passo 1: Fazer Upload dos Arquivos Atualizados

No seu **computador local**, sincronize os arquivos com o VPS:

```bash
# Fazer commit das mudanças
git add .
git commit -m "Fix: Correção de renovação automática de certificados SSL"
git push

# OU copiar diretamente via SCP (se não usar git)
scp scripts/*.sh root@SEU_VPS_IP:/root/MolecularSciencesLibrary/scripts/
scp docker-compose.yml root@SEU_VPS_IP:/root/MolecularSciencesLibrary/
```

### Passo 2: Executar o Script de Correção no VPS

Conecte-se ao seu VPS via SSH:

```bash
ssh root@SEU_VPS_IP
```

Execute o script de correção:

```bash
cd /root/MolecularSciencesLibrary
chmod +x scripts/fix-ssl-renewal.sh
bash scripts/fix-ssl-renewal.sh
```

Este script irá:
- ✅ Diagnosticar o estado atual dos certificados
- ✅ Configurar hooks de renovação
- ✅ Adicionar cronjobs de backup
- ✅ Copiar certificados atuais
- ✅ Tentar renovar se estiverem expirando
- ✅ Reiniciar containers

### Passo 3: Renovar Certificados Manualmente (se expirados)

Se os certificados já expiraram, force a renovação:

```bash
cd /root/MolecularSciencesLibrary

# Parar o frontend temporariamente
docker compose stop frontend

# Renovar certificados
certbot renew --force-renewal

# Copiar certificados para a pasta do projeto
bash scripts/copy-ssl-certs.sh

# Reiniciar todos os containers
docker compose up -d
```

### Passo 4: Verificar se Está Funcionando

```bash
# Verificar certificado em uso pelo site
echo | openssl s_client -servername bibliotecamoleculares.com -connect bibliotecamoleculares.com:443 2>/dev/null | openssl x509 -noout -dates

# Verificar logs
tail -f /var/log/ssl-renewal.log

# Testar renovação (dry-run)
certbot renew --dry-run
```

## 🤖 Automação Configurada

Após executar o script de correção, você terá:

### 1. Hook do Certbot
- **Localização**: `/etc/letsencrypt/renewal-hooks/deploy/copy-ssl-certs.sh`
- **Função**: Executado automaticamente após o certbot renovar os certificados
- **Ação**: Copia certificados para o projeto e reinicia o frontend

### 2. Cronjob do Certbot
- **Horário**: 2h da manhã, todos os dias
- **Comando**: `certbot renew --quiet --post-hook 'bash /root/MolecularSciencesLibrary/scripts/certbot-renewal-hook.sh'`
- **Log**: `/var/log/certbot-renew.log`

### 3. Cronjob de Backup
- **Horário**: 3h da manhã, todos os dias
- **Comando**: Copia certificados mesmo que o certbot não tenha rodado
- **Log**: `/var/log/ssl-copy.log`

### 4. Container Certbot
- **Função**: Verificação adicional dentro do Docker
- **Frequência**: A cada 24 horas
- **Volume**: Acesso direto a `/etc/letsencrypt` do host

## 🔍 Monitoramento

### Ver Logs em Tempo Real

```bash
# Log de renovação SSL
tail -f /var/log/ssl-renewal.log

# Log de cópia diária
tail -f /var/log/ssl-copy.log

# Log do certbot
tail -f /var/log/letsencrypt/letsencrypt.log

# Log do certbot cronjob
tail -f /var/log/certbot-renew.log
```

### Verificar Cronjobs

```bash
# Ver cronjobs configurados
crontab -l

# Editar cronjobs (se necessário)
crontab -e
```

### Verificar Containers

```bash
cd /root/MolecularSciencesLibrary

# Ver status dos containers
docker compose ps

# Ver logs do certbot container
docker compose logs certbot

# Ver logs do frontend
docker compose logs frontend
```

## 🧪 Testes

### Testar Renovação (Dry Run)

```bash
# Teste sem modificar nada
certbot renew --dry-run
```

### Testar Script de Cópia

```bash
bash /root/MolecularSciencesLibrary/scripts/copy-ssl-certs.sh
```

### Testar Hook Completo

```bash
bash /root/MolecularSciencesLibrary/scripts/certbot-renewal-hook.sh
```

### Verificar Certificado do Site

```bash
# Verificar certificado atual do site
curl -vI https://bibliotecamoleculares.com 2>&1 | grep -A 5 "SSL certificate"

# Ou usando openssl
echo | openssl s_client -servername bibliotecamoleculares.com -connect bibliotecamoleculares.com:443 2>/dev/null | openssl x509 -noout -text | grep -A 2 "Validity"
```

## 🆘 Solução de Problemas

### Problema: Certificados ainda não renovam

```bash
# 1. Verificar se o certbot está instalado
certbot --version

# 2. Verificar configuração do domínio
cat /etc/letsencrypt/renewal/bibliotecamoleculares.com.conf

# 3. Verificar se a porta 80 está acessível
curl -I http://bibliotecamoleculares.com/.well-known/acme-challenge/test

# 4. Forçar renovação manual
certbot renew --force-renewal --webroot -w /root/MolecularSciencesLibrary/certbot/www
```

### Problema: Hook não executa

```bash
# 1. Verificar permissões
ls -la /etc/letsencrypt/renewal-hooks/deploy/

# 2. Tornar executável
chmod +x /etc/letsencrypt/renewal-hooks/deploy/copy-ssl-certs.sh

# 3. Testar hook manualmente
bash /etc/letsencrypt/renewal-hooks/deploy/copy-ssl-certs.sh
```

### Problema: Docker não reinicia

```bash
# 1. Verificar se docker compose está instalado
docker compose version

# 2. Reiniciar manualmente
cd /root/MolecularSciencesLibrary
docker compose restart frontend
```

## 📅 Cronograma de Renovação

- **60 dias antes da expiração**: Certbot pode renovar
- **30 dias antes da expiração**: Certbot começa a tentar renovar automaticamente
- **Diariamente às 2h**: Cronjob verifica se precisa renovar
- **Diariamente às 3h**: Cronjob de backup copia certificados
- **A cada 24h**: Container certbot também verifica

## 🎯 Próximos Passos

1. ✅ Execute o script de correção no VPS
2. ✅ Verifique se os certificados foram renovados
3. ✅ Teste o site em https://bibliotecamoleculares.com
4. ✅ Configure alertas de monitoramento (opcional)
5. ✅ Documente o IP do seu VPS neste arquivo

## 📝 Notas Importantes

- **Backup**: Os certificados antigos não são excluídos, apenas sobrescritos
- **Logs**: Todos os logs são salvos em `/var/log/`
- **Múltiplas camadas**: Sistema tem 3 mecanismos de renovação para garantir funcionamento
- **Let's Encrypt**: Limite de 5 tentativas por semana por domínio

## ✅ Checklist de Verificação

Após instalação, verifique:

- [ ] Script de correção executado sem erros
- [ ] Certificados copiados para `/root/MolecularSciencesLibrary/ssl/`
- [ ] Hook configurado em `/etc/letsencrypt/renewal-hooks/deploy/`
- [ ] Cronjobs listados em `crontab -l`
- [ ] Site acessível via HTTPS sem erros
- [ ] Certificado válido (não autoassinado)
- [ ] Logs sendo criados em `/var/log/`

## 🔗 Links Úteis

- [Documentação Let's Encrypt](https://letsencrypt.org/docs/)
- [Certbot Docs](https://eff-certbot.readthedocs.io/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

**Última atualização**: 28 de Novembro de 2025
**Versão**: 2.0
