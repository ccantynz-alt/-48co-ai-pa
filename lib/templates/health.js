/**
 * SaleOnline.co.nz — Health Template
 *
 * For: dentists, physios, doctors, specialists, vets, gyms
 * Design: Clean, trustworthy, calming. Appointment booking, qualifications, patient-focused.
 */
import { htmlShell, getPageList, escapeHtml } from './base.js'

export function generateHealthSite(content) {
  const pages = getPageList()
  // Rename "Services" to "Treatments" for health
  pages[2] = { href: '/services.html', label: 'Treatments' }
  const c = content

  return {
    'index.html': generateHomepage(c, pages),
    'about.html': generateAboutPage(c, pages),
    'services.html': generateTreatmentsPage(c, pages),
    'contact.html': generateContactPage(c, pages),
  }
}

function generateHomepage(c, pages) {
  const hero = c.homepage?.hero || {}
  const services = c.homepage?.services || []
  const stats = c.homepage?.stats || []

  const servicesHtml = services.slice(0, 6).map(s => `
    <div class="reveal bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
      <div class="text-3xl mb-3">${s.icon || '🏥'}</div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">${escapeHtml(s.name)}</h3>
      <p class="text-sm text-gray-500 leading-relaxed">${escapeHtml(s.description)}</p>
    </div>
  `).join('')

  const statsHtml = stats.slice(0, 4).map(s => `
    <div class="text-center"><div class="text-3xl font-extrabold text-primary mb-1">${escapeHtml(s.number)}</div><div class="text-sm text-gray-500">${escapeHtml(s.label)}</div></div>
  `).join('')

  const bodyContent = `
    <section class="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 text-white py-28 md:py-40 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-up">
          <span class="w-2 h-2 rounded-full bg-green-400"></span>
          Accepting new patients
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-up animate-delay-1">
          ${escapeHtml(hero.heading || 'Your Health, Our Priority')}
        </h1>
        <p class="text-lg text-white/70 leading-relaxed mb-10 animate-fade-up animate-delay-2">
          ${escapeHtml(hero.subheading || 'Compassionate, professional care for the whole community.')}
        </p>
        <a href="/contact.html" class="btn-primary px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-all animate-fade-up animate-delay-3">
          ${escapeHtml(hero.cta || 'Book an Appointment')}
        </a>
      </div>
    </section>

    ${stats.length > 0 ? `<section class="bg-white border-b border-gray-100 py-10 px-4"><div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">${statsHtml}</div></section>` : ''}

    <section class="py-20 md:py-28 px-4 sm:px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Treatments</p>
          <h2 class="text-3xl font-bold text-gray-900">How We Can Help</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">${servicesHtml}</div>
      </div>
    </section>

    <section class="py-20 px-4 sm:px-6 bg-primary text-white">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Ready to book?</h2>
        <p class="text-white/80 mb-8">Contact us to schedule your appointment. New patients welcome.</p>
        <a href="/contact.html" class="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-bold transition-all hover:bg-gray-100">
          Book Now
        </a>
      </div>
    </section>
  `
  return htmlShell({ title: c.seo?.title || c.businessName, description: c.seo?.description, colors: c.colors, bodyContent, currentPage: '/index.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateAboutPage(c, pages) {
  const about = c.aboutPage || {}
  const storyParagraphs = (about.story || '').split('\n').filter(p => p.trim()).map(p => `<p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(p)}</p>`).join('')
  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto">
      <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">About Us</p>
      <h1 class="text-3xl font-bold text-gray-900 mb-8">${escapeHtml(about.heading || 'Our Practice')}</h1>
      <div class="prose prose-lg max-w-none">${storyParagraphs}</div>
    </div></section>
  `
  return htmlShell({ title: `About - ${c.businessName}`, description: `About ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/about.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateTreatmentsPage(c, pages) {
  const sp = c.servicesPage || {}
  const services = sp.services || c.homepage?.services || []
  const servicesHtml = services.map(s => `
    <div class="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h3 class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(s.name)}</h3>
      <p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(s.description)}</p>
      ${s.features ? `<ul class="flex flex-col gap-2">${s.features.map(f => `<li class="flex items-center gap-2 text-sm text-gray-600"><svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
    </div>
  `).join('')
  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Treatments</p>
        <h1 class="text-3xl font-bold text-gray-900">${escapeHtml(sp.heading || 'Our Treatments')}</h1>
      </div>
      <div class="grid md:grid-cols-2 gap-6">${servicesHtml}</div>
    </div></section>
  `
  return htmlShell({ title: `Treatments - ${c.businessName}`, description: `Treatments at ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/services.html', pages, businessName: c.businessName, phone: c.phone })
}

function generateContactPage(c, pages) {
  const contact = c.contactPage || {}
  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6"><div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Book Now</p>
        <h1 class="text-3xl font-bold text-gray-900">${escapeHtml(contact.heading || 'Contact Us')}</h1>
      </div>
      <div class="grid lg:grid-cols-2 gap-12">
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Request an Appointment</h2>
          <form class="flex flex-col gap-5" onsubmit="event.preventDefault(); alert('Thank you! We will confirm your appointment shortly.')">
            <div class="grid sm:grid-cols-2 gap-4">
              <input type="text" required placeholder="Full name" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
              <input type="tel" placeholder="Phone" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
            </div>
            <input type="email" required placeholder="Email" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
            <textarea rows="4" placeholder="Describe your concern..." class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"></textarea>
            <button type="submit" class="btn-primary px-8 py-3.5 rounded-lg text-sm font-semibold transition-all">Request Appointment</button>
          </form>
        </div>
        <div class="flex flex-col gap-6">
          <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Clinic Hours</h3>
            <p class="text-sm text-gray-600">${escapeHtml(contact.hours || 'Mon-Fri: 8am-5pm')}</p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Location</h3>
            <p class="text-sm text-gray-600">${escapeHtml(c.address || 'Contact us')}</p>
          </div>
        </div>
      </div>
    </div></section>
  `
  return htmlShell({ title: `Contact - ${c.businessName}`, description: `Contact ${c.businessName}`, colors: c.colors, bodyContent, currentPage: '/contact.html', pages, businessName: c.businessName, phone: c.phone })
}
