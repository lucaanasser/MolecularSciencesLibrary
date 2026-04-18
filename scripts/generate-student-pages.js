#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = path.join(ROOT, 'ccm-website-public-sandbox', 'estudantes');
const TARGET_ROOT = path.join(ROOT, 'CMsite-sandbox', 'comunidade', 'estudantes-pages');

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-{2,}/g, '-');
}

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function linkify(url) {
  if (!hasText(url)) return '';
  const value = String(url).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function renderList(items, itemClass = '') {
  if (!items.length) return '';
  const classAttr = itemClass ? ` class="${itemClass}"` : '';
  const lis = items.map((item) => `<li${classAttr}>${item}</li>`).join('\n');
  return `<ul>${lis}</ul>`;
}

function renderProfilePage(profile, year, slug) {
  const nome = esc(profile.nome || 'Perfil sem nome');
  const turma = esc(profile.turma || year);
  const origem = esc(profile.origem || '');

  const especializacao = safeArray(profile.especializacao)
    .filter(hasText)
    .map((v) => `<span class="tag">${esc(v)}</span>`)
    .join('');

  const concentracao = safeArray(profile.concentracao)
    .filter(hasText)
    .map((v) => `<span class="tag">${esc(v)}</span>`)
    .join('');

  const conteudo = safeArray(profile.conteudo)
    .filter(hasText)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('\n');

  const avancadoItems = safeArray(profile.avancado)
    .filter(hasText)
    .map((v) => esc(v));

  const conquistasItems = safeArray(profile.conquistas)
    .filter(hasText)
    .map((v) => esc(v));

  const extracurricularItems = safeArray(profile.extracurricular)
    .filter((item) => item && (hasText(item.title) || hasText(item.link)))
    .map((item) => {
      const title = esc(item.title || item.link || 'Link');
      const href = linkify(item.link || '');
      if (!href) return title;
      return `<a href="${esc(href)}" target="_blank" rel="noopener">${title}</a>`;
    });

  const contato = profile.contact || profile.contato || {};
  const contactMap = [
    ['Email', contato.email],
    ['LinkedIn', contato.linkedin],
    ['Lattes', contato.lattes],
    ['GitHub', contato.github],
    ['Site', contato.site],
    ['Behance', contato.behance],
    ['Telefone', contato.telefone]
  ].filter(([, v]) => hasText(v));

  const contactList = contactMap.length
    ? `<ul class="contact-list">${contactMap
        .map(([label, value]) => {
          const href = label === 'Email' ? `mailto:${value}` : linkify(value);
          if (label === 'Telefone') return `<li><strong>${label}:</strong> ${esc(value)}</li>`;
          return `<li><strong>${label}:</strong> <a href="${esc(href)}" target="_blank" rel="noopener">${esc(value)}</a></li>`;
        })
        .join('\n')}</ul>`
    : '<p>Nenhum contato publico informado.</p>';

  const photoBlock = profile.hasPhoto
    ? `<img class="student-photo" src="/estudantes/${year}/${slug}.jpg" srcset="/estudantes/${year}/${slug}@2x.jpg 2x" alt="Foto de ${nome}">`
    : '';

  return `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="${nome} ingressou no Curso de Ciencias Moleculares na turma de ${turma}.">
  <title>${nome} | Ciencias Moleculares</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/css/bootstrap.min.css">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <link href="/arquivos/css/20210602_style-min.css" rel="stylesheet">
  <style>
    body{opacity:1!important;background:#fff;font-family:'Open Sans',sans-serif;color:#333}
    .breadcrumb{background:transparent;padding:1rem 0 0;margin-bottom:2rem;font-size:.9rem}
    .breadcrumb-item+.breadcrumb-item::before{content:' • '}
    .breadcrumb-item a{color:#555;text-decoration:none}
    .breadcrumb-item a:hover{color:#00a356}
    .breadcrumb-item.active{color:#555}
    
    .page-header{margin-bottom:3rem;padding-bottom:2rem;border-bottom:4px solid #00a356}
    .page-header h1{font-family:'DM Sans',sans-serif;font-size:2.2rem;font-weight:700;color:#000;margin-bottom:0;text-transform:uppercase;letter-spacing:.5px}
    
    .student-container{display:grid;grid-template-columns:280px 1fr;gap:2rem;margin-top:2rem}
    .sidebar-nav{padding:1.5rem;background:#f8f9fa;border-radius:8px;height:fit-content;position:sticky;top:1rem}
    .sidebar-nav h3{font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:700;color:#00a356;text-transform:uppercase;margin-bottom:1rem;padding-bottom:.5rem;border-bottom:2px solid #00a356}
    .sidebar-nav a{display:block;padding:.6rem .8rem;margin:.3rem 0;color:#555;text-decoration:none;border-left:3px solid transparent}
    .sidebar-nav a:hover,.sidebar-nav a.active{color:#00a356;background:#e8f5e9;border-left-color:#00a356}
    
    .main-content{flex:1}
    .student-header{display:grid;grid-template-columns:1fr 320px;gap:2rem;margin-bottom:2rem}
    
    .student-info h2{font-family:'DM Sans',sans-serif;font-size:1.8rem;font-weight:700;color:#000;margin-bottom:.5rem}
    .student-badge{display:inline-block;background:#f0f0f0;padding:.4rem .8rem;border-radius:20px;font-size:.85rem;color:#666;margin-bottom:1rem}
    .student-meta{font-size:.95rem;color:#666;line-height:1.6}
    
    .student-photo{width:100%;max-width:300px;border-radius:8px;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    
    .section{margin-bottom:2.5rem}
    .section h3{font-family:'DM Sans',sans-serif;font-size:1.15rem;font-weight:700;color:#000;margin-bottom:1rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #00a356;padding-bottom:.5rem;display:inline-block}
    .section p{line-height:1.7;color:#555;margin-bottom:.8rem}
    .section ul{margin-left:1.2rem;margin-bottom:0}
    .section li{margin-bottom:.6rem;color:#555;line-height:1.5}
    .section a{color:#00a356;text-decoration:none}
    .section a:hover{text-decoration:underline}
    
    .tags{margin-bottom:1rem}
    .tag{display:inline-block;padding:.35rem .8rem;margin:.3rem .4rem .3rem 0;border-radius:20px;background:#f0f0f0;color:#555;font-size:.85rem}
    
    .contact-list{list-style:none;padding:0;margin:0}
    .contact-list li{margin-bottom:.7rem;color:#555;line-height:1.5}
    .contact-list strong{color:#333}
    .contact-list a{color:#00a356;text-decoration:none}
    .contact-list a:hover{text-decoration:underline}
    
    @media(max-width:768px){
      .student-container{grid-template-columns:1fr}
      .sidebar-nav{display:none}
      .student-header{grid-template-columns:1fr}
      .student-photo{max-width:100%}
      .page-header h1{font-size:1.6rem}
    }
  </style>
</head>
<body onload="document.body.className += 'loaded';">
  <div style="max-width:1200px;margin:0 auto;padding:0 1.5rem">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/">Início</a></li>
        <li class="breadcrumb-item"><a href="/comunidade">Nossa Comunidade</a></li>
        <li class="breadcrumb-item"><a href="/comunidade/estudantes">Conheça os Estudantes</a></li>
        <li class="breadcrumb-item active" aria-current="page">${nome}</li>
      </ol>
    </nav>

    <div class="page-header">
      <h1>Conheça os Estudantes</h1>
    </div>

    <div class="student-container">
      <aside class="sidebar-nav">
        <h3>Descubra nossa cultura</h3>
        <a href="/comunidade/estudantes">Conheça os Estudantes</a>
        <a href="#" onclick="return false">${nome}</a>
        <a href="/comunidade/projetos-estudantis">Projetos Estudantis</a>
        <a href="/comunidade/inova-usp">O inova USP</a>
        <a href="/comunidade/vida-campus">A Vida no Campus</a>
        <a href="/comunidade/coordenacao">Coordenação & Diretoria</a>
      </aside>

      <main class="main-content">
        <div class="student-header">
          <div class="student-info">
            <h2>${nome}</h2>
            <div class="student-badge">Turma de ${turma}</div>
            ${especializacao || concentracao ? `
              <p class="student-meta">
                <strong>Área de Especialização:</strong> ${especializacao.replace(/<span class="tag">|<\/span>/g, '').split('</span>').join(', ')}<br>
                ${concentracao ? `<strong>Áreas de Concentração:</strong> ${concentracao.replace(/<span class="tag">|<\/span>/g, '').split('</span>').join(', ')}` : ''}
              </p>
            ` : ''}
            ${origem ? `<p class="student-meta"><strong>Origem:</strong> ${origem}</p>` : ''}
          </div>
          ${photoBlock ? `<div>${photoBlock}</div>` : ''}
        </div>

        ${conteudo ? `<section class="section"><h3>Sobre</h3>${conteudo}</section>` : ''}

        ${avancadoItems.length ? `<section class="section"><h3>Projeto de Avançado</h3>${renderList(avancadoItems)}</section>` : ''}

        ${extracurricularItems.length ? `<section class="section"><h3>Projetos Extracurriculares</h3>${renderList(extracurricularItems)}</section>` : ''}

        ${conquistasItems.length ? `<section class="section"><h3>Conquistas</h3>${renderList(conquistasItems)}</section>` : ''}

        <section class="section">
          <h3>Mais Informações</h3>
          ${contactList}
        </section>
      </main>
    </div>
  </div>
</body>
</html>`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function generate() {
  if (!fs.existsSync(SOURCE_ROOT)) {
    console.error(`[error] source not found: ${SOURCE_ROOT}`);
    process.exit(1);
  }

  fs.rmSync(TARGET_ROOT, { recursive: true, force: true });
  ensureDir(TARGET_ROOT);

  const years = fs.readdirSync(SOURCE_ROOT).filter((name) => /^\d{4}$/.test(name));
  const generated = [];

  for (const year of years) {
    const yearDir = path.join(SOURCE_ROOT, year);
    const files = fs.readdirSync(yearDir).filter((f) => f.endsWith('.json') && f !== `${year}.json`);

    for (const file of files) {
      const sourceFile = path.join(yearDir, file);
      const profile = readJson(sourceFile);
      const slug = path.basename(file, '.json');

      if (!hasText(profile.nome) || !hasText(profile.turma)) {
        continue;
      }

      const outputDir = path.join(TARGET_ROOT, year, slug);
      ensureDir(outputDir);

      const html = renderProfilePage(profile, year, slugify(slug));
      const outputFile = path.join(outputDir, 'index.html');
      fs.writeFileSync(outputFile, html, 'utf8');
      generated.push({ year, slug, outputFile });

      console.log(`created: /comunidade/estudantes/${year}/${slug}`);
    }
  }

  const manifestPath = path.join(TARGET_ROOT, 'manifest.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), count: generated.length, pages: generated }, null, 2) + '\n',
    'utf8'
  );

  console.log(`\n[done] generated ${generated.length} pages`);
  console.log(`[done] manifest: ${manifestPath}`);
}

if (require.main === module) {
  generate();
}

module.exports = { generate, slugify };
