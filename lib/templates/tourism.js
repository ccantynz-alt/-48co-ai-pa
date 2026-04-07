/**
 * SaleOnline.co.nz — Tourism Template
 *
 * For: tour operators, activities, accommodation, travel agencies
 * Design: Vibrant, adventurous, experiential. Gallery focus, booking CTAs, location emphasis.
 */
import { htmlShell, getPageList, escapeHtml } from './base.js'

export function generateTourismSite(content) {
  const pages = getPageList()
  pages[2] = { href: '/services.html', label: 'Experiences' }
  const c = content

  return {
    'index.html': generateHomepage(c, pages),
    'about.html': generateAboutPage(c, pages),
    'services.html': generateExperiencesPage(c, pages),
    'contact.html': generateContactPage(c, pages),
  }
}

function generateHomepage(c, pages) {
  const hero = c.homepage?.hero || {}
  const services = c.homepage?.services || []
  const stats = c.homepage?.stats || []

  const servicesHtml = services.slice(0, 6).map(s => `
    <div class="reveal bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
      <div class="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><span class="text-5xl">${s.icon || '🌏'}</span></div>
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-2">${escapeHtml(s.name)}</h3>
        <p class="text-sm text-gray-500 leading-relaxed">${escapeHtml(s.description)}</p>
      </div>
    </div>
  `).join('')

  const statsHtml = stats.slice(0, 4).map(s => `<div class="text-center"><div class="text-3xl font-extrabold text-white mb-1">${escapeHtml(s.number)}</div><div class="text-sm text-white/60">${escapeHtml(s.label)}</div></div>`).join('')

  const bodyContent = `
    <section class="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white py-28 md:py-44 px-4 sm:px-6 overflow-hidden">
      <div class="max-w-3xl mx-auto text-center relative z-10">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-up">
          ${escapeHtml(hero.heading || 'Unforgettable Experiences Await')}
        </h1>
        <p class="text-lg text-white/70 leading-relaxed mb-10 animate-fade-up animate-delay-1">
          ${escapeHtml(hero.subheading || 'Discover the best of what our region has to offer.')}
        </p>
        <a href="/services.html" class="btn-primary px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-all animate-fade-up animate-delay-2">
          ${escapeHtml(hero.cta || 'Explore Experiences')}
        </a>
      </div>
      ${stats.length > 0 ? `<div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">${statsHtml}</div>` : ''}
    </section>
    <section class="py-20 md:py-28 px-4 sm:px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16"><p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Experiences</p><h2 class="text-3xl font-bold text-gray-900">What We Offer</h2></div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">${servicesHtml}</div>
      </div>
    </section>
    <section class="py-20 px-4 sm:px-6 bg-primary text-white">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Ready for an adventure?</h2>
        <p class="text-white/80 mb-8">Book your experience today. Group discounts available.</p>
        <a href="/contact.html" class="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-bold transition-all hover:bg-gray-100">Book Now</a>
      </div>
    </section>
  `
  return htmlShell({ title: c.seo?.title || c.businessName, description: c.seo?.description, colors: c.colors, bodyContent, currentPage: '/index.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateAboutPage(c, pages) {
  const about = c.aboutPage || {}
  const storyParagraphs = (about.story || '').split('\n').filter(p => p.trim()).map(p => `<p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(p)}</p>`).join('')
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8">${escapeHtml(about.heading || 'About Us')}</h1><div class="prose prose-lg max-w-none">${storyParagraphs}</div></div></section>`
  return htmlShell({ title: `About - ${c.businessName}`, description: `About ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/about.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateExperiencesPage(c, pages) {
  const sp = c.servicesPage || {}
  const services = sp.services || c.homepage?.services || []
  const servicesHtml = services.map(s => `<div class="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100"><h3 class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(s.name)}</h3><p class="text-gray-600 leading-relaxed">${escapeHtml(s.description)}</p></div>`).join('')
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><div class="text-center mb-16"><h1 class="text-3xl font-bold text-gray-900">${escapeHtml(sp.heading || 'Our Experiences')}</h1></div><div class="grid md:grid-cols-2 gap-6">${servicesHtml}</div></div></section>`
  return htmlShell({ title: `Experiences - ${c.businessName}`, description: `Experiences with ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/services.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateContactPage(c, pages) {
  const contact = c.contactPage || {}
  const bodyContent = `<section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto"><div class="text-center mb-16"><h1 class="text-3xl font-bold text-gray-900">${escapeHtml(contact.heading || 'Book With Us')}</h1></div><div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-xl mx-auto"><form class="flex flex-col gap-5" onsubmit="event.preventDefault(); alert('Thank you! We will confirm your booking.')"><input type="text" required placeholder="Name" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><input type="email" required placeholder="Email" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><input type="date" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><select class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm"><option>1 person</option><option>2 people</option><option>3-5 people</option><option>6-10 people</option><option>10+ people</option></select><textarea rows="3" placeholder="Any special requirements?" class="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-sm resize-none"></textarea><button type="submit" class="btn-primary px-8 py-3.5 rounded-lg text-sm font-semibold">Request Booking</button></form></div></div></section>`
  return htmlShell({ title: `Book - ${c.businessName}`, description: `Book with ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/contact.html', pages, businessName: c.businessName, phone: c.phone })
}
