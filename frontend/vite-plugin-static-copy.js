import staticCopy from 'vite-plugin-static-copy';

export default staticCopy({
  targets: [
    { src: 'public/sitemap.xml', dest: '' }
  ]
});
