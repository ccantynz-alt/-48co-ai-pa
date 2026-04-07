/**
 * SaleOnline.co.nz — Base Template Engine
 *
 * Generates complete static websites from AI-generated content.
 * Outputs clean HTML + Tailwind CSS (via CDN for generated sites).
 * Each generated site is a self-contained static site.
 */

/**
 * Wrap page content in the full HTML shell
 */
export function htmlShell({ title, description, keywords, ogTitle, ogDescription, colors, bodyContent, currentPage, pages, businessName, phone }) {
  const primary = colors?.primary || '#2563eb'
  const secondary = colors?.secondary || '#f59e0b'
  const bg = colors?.background || '#ffffff'

  const navLinks = pages.map(p =>
    `<a href="${p.href}" class="text-sm font-medium ${p.href === currentPage ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors">${p.label}</a>`
  ).join('\n            ')

  const mobileNavLinks = pages.map(p =>
    `<a href="${p.href}" class="block px-4 py-3 text-base font-medium ${p.href === currentPage ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'} transition-colors rounded-lg">${p.label}</a>`
  ).join('\n              ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description || '')}">
  <meta name="keywords" content="${escapeHtml((keywords || []).join(', '))}">
  <meta property="og:title" content="${escapeHtml(ogTitle || title)}">
  <meta property="og:description" content="${escapeHtml(ogDescription || description || '')}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${primary}',
            secondary: '${secondary}',
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
        },
      },
    }
  </script>
  <style>
    :root { --primary: ${primary}; --secondary: ${secondary}; }
    body { font-family: 'Inter', system-ui, sans-serif; background: ${bg}; }
    .btn-primary { background: ${primary}; color: white; }
    .btn-primary:hover { filter: brightness(1.1); }
    .btn-secondary { background: transparent; border: 2px solid ${primary}; color: ${primary}; }
    .btn-secondary:hover { background: ${primary}; color: white; }
    .text-primary { color: ${primary}; }
    .bg-primary { background: ${primary}; }
    .border-primary { border-color: ${primary}; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.6s ease-out both; }
    .animate-delay-1 { animation-delay: 0.1s; }
    .animate-delay-2 { animation-delay: 0.2s; }
    .animate-delay-3 { animation-delay: 0.3s; }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <!-- Navigation -->
  <nav class="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <a href="/" class="text-xl font-bold text-gray-900">
          ${escapeHtml(businessName || 'Business')}
        </a>
        <div class="hidden md:flex items-center gap-8">
          ${navLinks}
        </div>
        <div class="hidden md:flex items-center gap-3">
          ${phone && phone !== 'placeholder' ? `<a href="tel:${phone}" class="text-sm font-semibold text-primary">${escapeHtml(phone)}</a>` : ''}
          <a href="/contact.html" class="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
            Get a Quote
          </a>
        </div>
        <button onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" class="md:hidden p-2" aria-label="Menu">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>
    <!-- Mobile menu -->
    <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-100 px-4 py-3">
      <div class="flex flex-col gap-1">
        ${mobileNavLinks}
        <a href="/contact.html" class="mt-2 btn-primary text-center px-5 py-3 rounded-lg text-sm font-semibold transition-all">
          Get a Quote
        </a>
      </div>
    </div>
  </nav>

  <!-- Main content -->
  <main class="flex-1 pt-16">
    ${bodyContent}
  </main>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-16 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto">
      <div class="grid md:grid-cols-3 gap-12">
        <div>
          <h3 class="text-lg font-bold mb-4">${escapeHtml(businessName || 'Business')}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">Professional service you can trust. Proudly serving the local community.</p>
        </div>
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Links</h4>
          <div class="flex flex-col gap-2">
            ${pages.map(p => `<a href="${p.href}" class="text-sm text-gray-400 hover:text-white transition-colors">${p.label}</a>`).join('\n            ')}
          </div>
        </div>
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Contact</h4>
          <div class="flex flex-col gap-2 text-sm text-gray-400">
            ${phone && phone !== 'placeholder' ? `<a href="tel:${phone}" class="hover:text-white transition-colors">${escapeHtml(phone)}</a>` : '<span>Phone coming soon</span>'}
            <span>Email us for enquiries</span>
          </div>
        </div>
      </div>
      <div class="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-xs text-gray-500">&copy; ${new Date().getFullYear()} ${escapeHtml(businessName || 'Business')}. All rights reserved.</p>
        <p class="text-xs text-gray-600">Website by <a href="https://saleonline.co.nz" class="text-gray-500 hover:text-white transition-colors">SaleOnline.co.nz</a></p>
      </div>
    </div>
  </footer>

  <script>
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  </script>
</body>
</html>`
}

/**
 * Generate the standard page list for navigation
 */
export function getPageList() {
  return [
    { href: '/index.html', label: 'Home' },
    { href: '/about.html', label: 'About' },
    { href: '/services.html', label: 'Services' },
    { href: '/contact.html', label: 'Contact' },
  ]
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str) {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
