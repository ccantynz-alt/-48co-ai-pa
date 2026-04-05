/**
 * SaleOnline.co.nz — Hospitality Template
 *
 * For: restaurants, cafes, bars, catering, food trucks
 * Design: Warm, inviting, food-focused. Menu highlights, opening hours, reservations.
 */
import { htmlShell, getPageList, escapeHtml } from './base.js'

export function generateHospitalitySite(content) {
  const pages = getPageList()
  // Rename "Services" to "Menu" for hospitality
  pages[2] = { href: '/services.html', label: 'Menu' }
  const c = content

  return {
    'index.html': generateHomepage(c, pages),
    'about.html': generateAboutPage(c, pages),
    'services.html': generateMenuPage(c, pages),
    'contact.html': generateContactPage(c, pages),
  }
}

function generateHomepage(c, pages) {
  const hero = c.homepage?.hero || {}
  const services = c.homepage?.services || []
  const whyUs = c.homepage?.whyUs || []

  const menuHighlightsHtml = services.slice(0, 6).map(s => `
    <div class="reveal bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-center group">
      <div class="text-4xl mb-3">${s.icon || '🍽️'}</div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">${escapeHtml(s.name)}</h3>
      <p class="text-sm text-gray-500 leading-relaxed">${escapeHtml(s.description)}</p>
    </div>
  `).join('')

  const bodyContent = `
    <section class="relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white py-28 md:py-40 px-4 sm:px-6 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(var(--primary-rgb,217,119,6),0.2),transparent_60%)]"></div>
      <div class="max-w-3xl mx-auto text-center relative z-10">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-up">
          ${escapeHtml(hero.heading || 'Welcome to Our Table')}
        </h1>
        <p class="text-lg md:text-xl text-white/70 leading-relaxed mb-10 animate-fade-up animate-delay-1">
          ${escapeHtml(hero.subheading || 'Fresh, local ingredients prepared with passion.')}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animate-delay-2">
          <a href="/services.html" class="btn-primary px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-all">
            ${escapeHtml(hero.cta || 'View Our Menu')}
          </a>
          <a href="/contact.html" class="btn-secondary px-8 py-4 rounded-xl text-base font-bold border-white/30 text-white hover:bg-white hover:text-stone-900 transition-all">
            Book a Table
          </a>
        </div>
      </div>
    </section>

    <section class="py-20 md:py-28 px-4 sm:px-6 bg-stone-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Menu</p>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Highlights</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${menuHighlightsHtml}
        </div>
        <div class="text-center mt-12">
          <a href="/services.html" class="btn-primary px-8 py-3.5 rounded-xl text-sm font-bold transition-all inline-block">
            View Full Menu
          </a>
        </div>
      </div>
    </section>

    <section class="py-20 px-4 sm:px-6 bg-primary text-white">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Reserve Your Table</h2>
        <p class="text-white/80 mb-8">Join us for an unforgettable dining experience.</p>
        <a href="/contact.html" class="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-bold transition-all hover:bg-gray-100">
          Make a Reservation
        </a>
      </div>
    </section>
  `

  return htmlShell({ title: c.seo?.title || c.businessName, description: c.seo?.description, keywords: c.seo?.keywords, colors: c.colors, bodyContent, currentPage: '/index.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateAboutPage(c, pages) {
  const about = c.aboutPage || {}
  const storyParagraphs = (about.story || '').split('\n').filter(p => p.trim()).map(p => `<p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(p)}</p>`).join('')

  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Story</p>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-8">${escapeHtml(about.heading || 'About Us')}</h1>
        <div class="prose prose-lg max-w-none">${storyParagraphs}</div>
      </div>
    </section>
  `
  return htmlShell({ title: `About - ${c.businessName}`, description: `About ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/about.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateMenuPage(c, pages) {
  const sp = c.servicesPage || {}
  const services = sp.services || c.homepage?.services || []
  const servicesHtml = services.map(s => `
    <div class="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div class="flex items-start gap-4 mb-3">
        <span class="text-2xl">${s.icon || '🍽️'}</span>
        <h3 class="text-xl font-bold text-gray-900">${escapeHtml(s.name)}</h3>
      </div>
      <p class="text-gray-600 leading-relaxed">${escapeHtml(s.description)}</p>
    </div>
  `).join('')

  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Menu</p>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900">${escapeHtml(sp.heading || 'Menu')}</h1>
        </div>
        <div class="grid md:grid-cols-2 gap-6">${servicesHtml}</div>
      </div>
    </section>
  `
  return htmlShell({ title: `Menu - ${c.businessName}`, description: `Menu at ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/services.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateContactPage(c, pages) {
  const contact = c.contactPage || {}
  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Visit Us</p>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900">${escapeHtml(contact.heading || 'Contact & Reservations')}</h1>
        </div>
        <div class="grid lg:grid-cols-2 gap-12">
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Make a Reservation</h2>
            <form class="flex flex-col gap-5" onsubmit="event.preventDefault(); alert('Thank you! We will confirm your reservation shortly.')">
              <input type="text" required placeholder="Name" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
              <input type="tel" placeholder="Phone" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
              <input type="date" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
              <select class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
                <option>2 guests</option><option>3 guests</option><option>4 guests</option><option>5 guests</option><option>6+ guests</option>
              </select>
              <textarea rows="3" placeholder="Special requests..." class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"></textarea>
              <button type="submit" class="btn-primary px-8 py-3.5 rounded-lg text-sm font-semibold transition-all">Reserve Now</button>
            </form>
          </div>
          <div class="flex flex-col gap-6">
            <div class="bg-stone-50 rounded-2xl p-8 border border-gray-100">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Opening Hours</h3>
              <p class="text-sm text-gray-600">${escapeHtml(contact.hours || 'Contact us for hours')}</p>
            </div>
            <div class="bg-stone-50 rounded-2xl p-8 border border-gray-100">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Location</h3>
              <p class="text-sm text-gray-600">${escapeHtml(c.address || 'Contact us for location')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
  return htmlShell({ title: `Contact - ${c.businessName}`, description: `Contact ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/contact.html', pages, businessName: c.businessName, phone: c.phone })
}
