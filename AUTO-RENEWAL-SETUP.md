# 🤖 Renovação 100% Automática de Certificados SSL

## 📋 O que foi implementado

Sistema completamente automático que:
- ✅ Verifica certificados toda semana
- ✅ Renova automaticamente quando faltam menos de 30 dias
- ✅ Para o frontend, renova e reinicia tudo sozinho
- ✅ **Não requer nenhuma intervenção manual**
- ✅ Registra tudo em logs

## 🚀 Instalação no VPS

### Passo 1: Atualizar código do Git

```bash
ssh root@SEU_VPS_IP
cd /root/MolecularSciencesLibrary
git pull origin main
```

### Passo 2: Executar configuração automática

```bash
chmod +x scripts/setup-auto-renewal.sh
bash scripts/setup-auto-renewal.sh
```

Este script irá:
1. ✅ Configurar permissões
2. ✅ Criar arquivos de log
3. ✅ Remover cronjobs antigos (que não funcionavam)
4. ✅ Adicionar novo cronjob automático
5. ✅ **Renovar os certificados agora se estiverem expirando**
6. ✅ Reiniciar containers

### Passo 3: Parar container certbot antigo

```bash
cd /root/MolecularSciencesLibrary
docker compose down certbot
docker compose up -d
```

## ✅ Pronto! Agora é 100% automático

O sistema agora funciona assim:

### 🔄 Funcionamento Automático

1. **Todo domingo às 3h da manhã (UTC / Meia-noite no Brasil)**:
   - Script verifica a validade dos certificados
   - Se faltam menos de 30 dias para expirar:
     - Para o frontend (libera porta 80)
     - Renova certificados com `certbot standalone`
     - Copia certificados para pasta do projeto
     - Reinicia o frontend
   - Se ainda tem mais de 30 dias, não faz nada

2. **Vantagens do método standalone**:
   - ✅ Não depende do frontend estar funcionando
   - ✅ Não tem problemas de timeout
   - ✅ Não tem problemas de firewall
   - ✅ Mais confiável que webroot

3. **Logs completos**:
   - Tudo é registrado em `/var/log/ssl-auto-renew.log`
   - Você pode verificar o histórico a qualquer momento

## 🔍 Monitoramento

### Ver logs da última renovação

```bash
tail -100 /var/log/ssl-auto-renew.log
```

### Ver logs em tempo real

```bash
tail -f /var/log/ssl-auto-renew.log
```

### Ver quando foi a última renovação

```bash
grep "Renovação automática concluída" /var/log/ssl-auto-renew.log | tail -5
```

### Verificar cronjob configurado

```bash
crontab -l
```

Deve mostrar algo como:
```
# Renovação automática de certificados SSL - toda semana às 3h da manhã
0 3 * * 0 bash /root/MolecularSciencesLibrary/scripts/auto-renew-ssl.sh >> /var/log/ssl-auto-renew.log 2>&1
```

### Verificar validade atual do certificado

```bash
openssl x509 -enddate -noout -in /root/MolecularSciencesLibrary/ssl/certificate.crt
```

### Verificar certificado do site online

```bash
echo | openssl s_client -servername bibliotecamoleculares.com -connect bibliotecamoleculares.com:443 2>/dev/null | openssl x509 -noout -dates
```

## 🧪 Testes

### Testar renovação manualmente (sem esperar o cronjob)

```bash
bash /root/MolecularSciencesLibrary/scripts/auto-renew-ssl.sh
```

### Simular que o certificado está expirando

Você pode editar o script temporariamente para testar. Mas **cuidado**: isso vai renovar o certificado de verdade.

### Ver o que o cronjob fará no próximo domingo

```bash
# Ver quando será a próxima execução
date -d "next Sunday 03:00"
```

## ⚠️ O que fazer se algo der errado

### Problema: Certificado não renova

```bash
# 1. Ver logs
tail -100 /var/log/ssl-auto-renew.log

# 2. Verificar se certbot está instalado
certbot --version

# 3. Testar renovação manual
bash /root/MolecularSciencesLibrary/scripts/auto-renew-ssl.sh

# 4. Se der erro, renovar diretamente
docker compose down
certbot certonly --standalone --force-renewal -d bibliotecamoleculares.com
bash /root/MolecularSciencesLibrary/scripts/copy-ssl-certs.sh
docker compose up -d
```

### Problema: Cronjob não executa

```bash
# 1. Verificar se cronjob existe
crontab -l | grep auto-renew-ssl

# 2. Verificar logs do cron
tail -50 /var/log/syslog | grep CRON

# 3. Reconfigurar
bash /root/MolecularSciencesLibrary/scripts/setup-auto-renewal.sh
```

### Problema: Site fica fora do ar

```bash
# Subir containers imediatamente
cd /root/MolecularSciencesLibrary
docker compose up -d

# Ver o que aconteceu
docker compose logs --tail=100
```

## 📊 Comparação: Antes vs Agora

### ❌ Antes (Não funcionava)

- Container certbot tentava renovar via webroot
- Timeout de conexão
- Hooks não executavam
- Certificados não eram copiados
- Certificados expiravam

### ✅ Agora (100% Automático)

- Cronjob semanal verifica certificados
- Usa certbot standalone (mais confiável)
- Para frontend, renova, reinicia tudo
- Certificados sempre atualizados
- Zero intervenção manual necessária

## 📅 Cronograma

- **Domingos às 3h da manhã**: Verificação automática
- **Se certificado < 30 dias**: Renovação automática
- **Let's Encrypt renova**: A cada 90 dias
- **Seu sistema verifica**: Toda semana
- **Margem de segurança**: 60 dias

## 🎯 Próximos Passos Recomendados

1. ✅ Configurar alerta de email quando renovar (opcional)
2. ✅ Monitorar logs mensalmente
3. ✅ Testar acesso HTTPS regularmente
4. ✅ Considerar monitoramento externo (UptimeRobot, etc)

## 📝 Notas Importantes

- **Downtime**: ~30 segundos durante renovação (apenas quando renova)
- **Frequência**: Apenas quando necessário (< 30 dias para expirar)
- **Logs**: Mantidos indefinidamente em `/var/log/ssl-auto-renew.log`
- **Backup**: Certbot mantém backups automáticos em `/etc/letsencrypt/`

## ✅ Checklist de Verificação

Execute após instalação:

```bash
# 1. Verificar cronjob
crontab -l | grep auto-renew-ssl
# Esperado: 1 linha com o cronjob

# 2. Verificar script executável
ls -la /root/MolecularSciencesLibrary/scripts/auto-renew-ssl.sh
# Esperado: -rwxr-xr-x (executável)

# 3. Verificar log criado
ls -la /var/log/ssl-auto-renew.log
# Esperado: arquivo existe

# 4. Verificar certificado atual
openssl x509 -enddate -noout -in /root/MolecularSciencesLibrary/ssl/certificate.crt
# Esperado: data futura

# 5. Verificar containers
docker compose ps
# Esperado: frontend, backend, cron, backup rodando
```

---

**Instalação completada!** 🎉

Seu site agora tem **renovação automática de certificados** sem necessidade de intervenção manual.

---

**Última atualização**: 29 de Novembro de 2025
**Versão**: 3.0 - Renovação 100% Automática
