/**
 * SaleOnline.co.nz — Mining Services Template
 *
 * For: mining equipment, drilling, FIFO services, environmental consulting, safety training
 * Design: Industrial, robust, professional. Safety focus, capability statements, project experience.
 */
import { htmlShell, getPageList, escapeHtml } from './base.js'

export function generateMiningSite(content) {
  const pages = getPageList()
  pages[2] = { href: '/services.html', label: 'Capabilities' }
  const c = content

  return {
    'index.html': generateHomepage(c, pages),
    'about.html': generateAboutPage(c, pages),
    'services.html': generateCapabilitiesPage(c, pages),
    'contact.html': generateContactPage(c, pages),
  }
}

function generateHomepage(c, pages) {
  const hero = c.homepage?.hero || {}
  const services = c.homepage?.services || []
  const stats = c.homepage?.stats || []

  const servicesHtml = services.slice(0, 6).map(s => `
    <div class="reveal bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-primary/20 transition-all">
      <div class="text-2xl mb-3">${s.icon || '⛏️'}</div>
      <h3 class="text-base font-bold text-gray-900 mb-2">${escapeHtml(s.name)}</h3>
      <p class="text-sm text-gray-500 leading-relaxed">${escapeHtml(s.description)}</p>
    </div>
  `).join('')

  const statsHtml = stats.slice(0, 4).map(s => `<div class="text-center"><div class="text-3xl font-extrabold text-amber-400 mb-1">${escapeHtml(s.number)}</div><div class="text-sm text-white/60">${escapeHtml(s.label)}</div></div>`).join('')

  const bodyContent = `
    <section class="relative bg-gradient-to-br from-gray-900 via-amber-950 to-gray-900 text-white py-28 md:py-40 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-up text-amber-400">
          ISO 45001 Certified
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-up animate-delay-1">
          ${escapeHtml(hero.heading || 'Mining Services You Can Rely On')}
        </h1>
        <p class="text-lg text-white/60 leading-relaxed mb-10 animate-fade-up animate-delay-2">
          ${escapeHtml(hero.subheading || 'Safe. Reliable. Experienced. Supporting mining operations across the region.')}
        </p>
        <a href="/contact.html" class="bg-amber-400 text-gray-900 px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-all hover:bg-amber-300 animate-fade-up animate-delay-3">
          ${escapeHtml(hero.cta || 'Request a Quote')}
        </a>
      </div>
      ${stats.length > 0 ? `<div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">${statsHtml}</div>` : ''}
    </section>
    <section class="py-20 md:py-28 px-4 sm:px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16"><p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Capabilities</p><h2 class="text-3xl font-bold text-gray-900">What We Do</h2></div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">${servicesHtml}</div>
      </div>
    </section>
    <section class="py-20 px-4 sm:px-6 bg-gray-900 text-white">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Need a reliable mining partner?</h2>
        <p class="text-white/60 mb-8">Contact us for a capability statement or project discussion.</p>
        <a href="/contact.html" class="inline-block bg-amber-400 text-gray-900 px-8 py-4 rounded-xl text-base font-bold transition-all hover:bg-amber-300">Get In Touch</a>
      </div>
    </section>
  `
  return htmlShell({ title: c.seo?.title || c.businessName, description: c.seo?.description, colors: c.colors, bodyContent, currentPage: '/index.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateAboutPage(c, pages) {
  const about = c.aboutPage || {}
  const storyParagraphs = (about.story || '').split('\n').filter(p => p.trim()).map(p => `<p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(p)}</p>`).join('')
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8">${escapeHtml(about.heading || 'About Our Company')}</h1><div class="prose prose-lg max-w-none">${storyParagraphs}</div></div></section>`
  return htmlShell({ title: `About - ${c.businessName}`, description: `About ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/about.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateCapabilitiesPage(c, pages) {
  const sp = c.servicesPage || {}
  const services = sp.services || c.homepage?.services || []
  const servicesHtml = services.map(s => `<div class="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100"><h3 class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(s.name)}</h3><p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(s.description)}</p>${s.features ? `<ul class="flex flex-col gap-2">${s.features.map(f => `<li class="flex items-center gap-2 text-sm text-gray-600"><svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}</div>`).join('')
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><div class="text-center mb-16"><h1 class="text-3xl font-bold text-gray-900">${escapeHtml(sp.heading || 'Our Capabilities')}</h1></div><div class="grid md:grid-cols-2 gap-6">${servicesHtml}</div></div></section>`
  return htmlShell({ title: `Capabilities - ${c.businessName}`, description: `Capabilities of ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/services.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateContactPage(c, pages) {
  const contact = c.contactPage || {}
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><div class="text-center mb-16"><h1 class="text-3xl font-bold text-gray-900">${escapeHtml(contact.heading || 'Contact Us')}</h1></div><div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-xl mx-auto"><form class="flex flex-col gap-5" onsubmit="event.preventDefault(); alert('Thank you. Our team will be in touch within 24 hours.')"><input type="text" required placeholder="Company name" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><input type="text" required placeholder="Contact name" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><input type="email" required placeholder="Email" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><input type="tel" placeholder="Phone" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><textarea rows="5" required placeholder="Project details or enquiry..." class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm resize-none"></textarea><button type="submit" class="btn-primary px-8 py-3.5 rounded-lg text-sm font-semibold">Submit Enquiry</button></form></div></div></section>`
  return htmlShell({ title: `Contact - ${c.businessName}`, description: `Contact ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/contact.html', pages, businessName: c.businessName, phone: c.phone })
}
