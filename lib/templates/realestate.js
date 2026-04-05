/**
 * SaleOnline.co.nz — Real Estate Template
 *
 * For: real estate agents, property managers, developers
 * Design: Premium, aspirational. Property showcases, testimonials, market authority.
 */
import { htmlShell, getPageList, escapeHtml } from './base.js'

export function generateRealEstateSite(content) {
  const pages = getPageList()
  pages[2] = { href: '/services.html', label: 'Properties' }
  const c = content

  return {
    'index.html': generateHomepage(c, pages),
    'about.html': generateAboutPage(c, pages),
    'services.html': generateServicesPage(c, pages),
    'contact.html': generateContactPage(c, pages),
  }
}

function generateHomepage(c, pages) {
  const hero = c.homepage?.hero || {}
  const services = c.homepage?.services || []
  const stats = c.homepage?.stats || []
  const whyUs = c.homepage?.whyUs || []

  const servicesHtml = services.slice(0, 6).map(s => `
    <div class="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
      <div class="text-3xl mb-4">${s.icon || '🏠'}</div>
      <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">${escapeHtml(s.name)}</h3>
      <p class="text-sm text-gray-500 leading-relaxed">${escapeHtml(s.description)}</p>
    </div>
  `).join('')

  const statsHtml = stats.slice(0, 4).map(s => `<div class="text-center"><div class="text-3xl font-extrabold text-primary mb-1">${escapeHtml(s.number)}</div><div class="text-sm text-gray-500">${escapeHtml(s.label)}</div></div>`).join('')

  const bodyContent = `
    <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-28 md:py-40 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto text-center relative z-10">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-up">
          ${escapeHtml(hero.heading || 'Find Your Dream Property')}
        </h1>
        <p class="text-lg text-white/70 leading-relaxed mb-10 animate-fade-up animate-delay-1">
          ${escapeHtml(hero.subheading || 'Local expertise. Premium results.')}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animate-delay-2">
          <a href="/contact.html" class="btn-primary px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-all">${escapeHtml(hero.cta || 'Get a Free Appraisal')}</a>
          <a href="/services.html" class="btn-secondary px-8 py-4 rounded-xl text-base font-bold border-white/30 text-white hover:bg-white hover:text-slate-900 transition-all">View Services</a>
        </div>
      </div>
    </section>
    ${stats.length > 0 ? `<section class="bg-white border-b border-gray-100 py-10 px-4"><div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">${statsHtml}</div></section>` : ''}
    <section class="py-20 md:py-28 px-4 sm:px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16"><p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Services</p><h2 class="text-3xl font-bold text-gray-900">What We Do</h2></div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">${servicesHtml}</div>
      </div>
    </section>
    <section class="py-20 px-4 sm:px-6 bg-primary text-white">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Thinking of selling?</h2>
        <p class="text-white/80 mb-8">Get a free, no-obligation property appraisal from our experienced team.</p>
        <a href="/contact.html" class="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-bold transition-all hover:bg-gray-100">Book Your Appraisal</a>
      </div>
    </section>
  `
  return htmlShell({ title: c.seo?.title || c.businessName, description: c.seo?.description, colors: c.colors, bodyContent, currentPage: '/index.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateAboutPage(c, pages) {
  const about = c.aboutPage || {}
  const storyParagraphs = (about.story || '').split('\n').filter(p => p.trim()).map(p => `<p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(p)}</p>`).join('')
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">About</p><h1 class="text-3xl font-bold text-gray-900 mb-8">${escapeHtml(about.heading || 'Our Team')}</h1><div class="prose prose-lg max-w-none">${storyParagraphs}</div></div></section>`
  return htmlShell({ title: `About - ${c.businessName}`, description: `About ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/about.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateServicesPage(c, pages) {
  const sp = c.servicesPage || {}
  const services = sp.services || c.homepage?.services || []
  const servicesHtml = services.map(s => `<div class="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100"><h3 class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(s.name)}</h3><p class="text-gray-600 leading-relaxed">${escapeHtml(s.description)}</p></div>`).join('')
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><div class="text-center mb-16"><h1 class="text-3xl font-bold text-gray-900">${escapeHtml(sp.heading || 'Our Services')}</h1></div><div class="grid md:grid-cols-2 gap-6">${servicesHtml}</div></div></section>`
  return htmlShell({ title: `Services - ${c.businessName}`, description: `Services from ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/services.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateContactPage(c, pages) {
  const contact = c.contactPage || {}
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><div class="text-center mb-16"><h1 class="text-3xl font-bold text-gray-900">${escapeHtml(contact.heading || 'Get In Touch')}</h1></div><div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-xl mx-auto"><form class="flex flex-col gap-5" onsubmit="event.preventDefault(); alert('Thank you! We will be in touch.')"><input type="text" required placeholder="Name" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><input type="email" required placeholder="Email" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><input type="tel" placeholder="Phone" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><textarea rows="4" placeholder="How can we help?" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm resize-none"></textarea><button type="submit" class="btn-primary px-8 py-3.5 rounded-lg text-sm font-semibold">Send Enquiry</button></form></div></div></section>`
  return htmlShell({ title: `Contact - ${c.businessName}`, description: `Contact ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/contact.html', pages, businessName: c.businessName, phone: c.phone })
}
