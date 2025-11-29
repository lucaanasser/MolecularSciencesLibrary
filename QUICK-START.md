# 🚀 INSTRUÇÕES RÁPIDAS - Renovação Automática SSL

## Execute estes comandos no VPS:

```bash
# 1. Conectar no VPS
ssh root@SEU_VPS_IP

# 2. Ir para o projeto
cd /root/MolecularSciencesLibrary

# 3. Puxar atualizações do Git
git pull origin main

# 4. Executar configuração automática
chmod +x scripts/setup-auto-renewal.sh
bash scripts/setup-auto-renewal.sh
```

## ✅ Pronto!

Após executar, você terá:

- ✅ Renovação automática toda semana
- ✅ Zero intervenção manual necessária
- ✅ Logs completos em `/var/log/ssl-auto-renew.log`
- ✅ Certificados sempre atualizados

## 🔍 Verificar se funcionou:

```bash
# Ver certificado atual
openssl x509 -enddate -noout -in /root/MolecularSciencesLibrary/ssl/certificate.crt

# Ver cronjob configurado
crontab -l

# Ver logs
tail -50 /var/log/ssl-auto-renew.log
```

## 📖 Documentação completa:

Veja `AUTO-RENEWAL-SETUP.md` para detalhes completos.
