/**
 * SaleOnline.co.nz — Trades Template
 *
 * For: plumbers, electricians, builders, painters, roofers, HVAC, cleaners, mechanics
 * Design: Bold, trustworthy, emergency-ready. Strong CTAs, social proof, service areas.
 */
import { htmlShell, getPageList, escapeHtml } from './base.js'

export function generateTradesSite(content) {
  const pages = getPageList()
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
  const whyUs = c.homepage?.whyUs || []
  const stats = c.homepage?.stats || []

  const servicesHtml = services.slice(0, 6).map((s, i) => `
    <div class="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
      <div class="text-3xl mb-4">${s.icon || '🔧'}</div>
      <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">${escapeHtml(s.name)}</h3>
      <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(s.description)}</p>
    </div>
  `).join('')

  const whyUsHtml = whyUs.slice(0, 4).map((w, i) => `
    <div class="reveal flex gap-4 items-start">
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div>
        <h3 class="text-base font-semibold text-gray-900 mb-1">${escapeHtml(w.title)}</h3>
        <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(w.description)}</p>
      </div>
    </div>
  `).join('')

  const statsHtml = stats.slice(0, 4).map(s => `
    <div class="text-center">
      <div class="text-3xl md:text-4xl font-extrabold text-primary mb-1">${escapeHtml(s.number)}</div>
      <div class="text-sm text-gray-500 font-medium">${escapeHtml(s.label)}</div>
    </div>
  `).join('')

  const bodyContent = `
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 md:py-36 px-4 sm:px-6 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb,37,99,235),0.15),transparent_60%)]"></div>
      <div class="max-w-6xl mx-auto relative z-10">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-up">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Available 24/7 for emergencies
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-up animate-delay-1">
            ${escapeHtml(hero.heading || 'Professional Service You Can Trust')}
          </h1>
          <p class="text-lg md:text-xl text-white/80 leading-relaxed mb-10 animate-fade-up animate-delay-2">
            ${escapeHtml(hero.subheading || 'Quality workmanship, honest pricing, and reliable service.')}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 animate-fade-up animate-delay-3">
            <a href="/contact.html" class="btn-primary px-8 py-4 rounded-xl text-base font-bold text-center shadow-lg shadow-primary/25 transition-all hover:shadow-xl">
              ${escapeHtml(hero.cta || 'Get a Free Quote')}
            </a>
            <a href="tel:${c.phone !== 'placeholder' ? c.phone : ''}" class="btn-secondary px-8 py-4 rounded-xl text-base font-bold text-center border-white/30 text-white hover:bg-white hover:text-gray-900 transition-all">
              Call Us Now
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    ${stats.length > 0 ? `
    <section class="bg-white border-b border-gray-100 py-10 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        ${statsHtml}
      </div>
    </section>
    ` : ''}

    <!-- Services -->
    <section class="py-20 md:py-28 px-4 sm:px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">What We Do</p>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Our Services</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${servicesHtml}
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    ${whyUs.length > 0 ? `
    <section class="py-20 md:py-28 px-4 sm:px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Why Choose Us</p>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Trusted by the local community
            </h2>
            <div class="flex flex-col gap-6">
              ${whyUsHtml}
            </div>
          </div>
          <div class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-12 flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-4">⭐</div>
              <div class="text-4xl font-extrabold text-gray-900 mb-2">5.0</div>
              <div class="text-sm text-gray-500 font-medium">Average Rating</div>
              <div class="text-xs text-gray-400 mt-1">Based on customer reviews</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    ` : ''}

    <!-- CTA Section -->
    <section class="py-20 md:py-28 px-4 sm:px-6 bg-primary text-white">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
        <p class="text-lg text-white/80 mb-10 leading-relaxed">
          Contact us today for a free, no-obligation quote. We respond within the hour.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact.html" class="bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-bold transition-all hover:bg-gray-100 shadow-lg">
            Get Your Free Quote
          </a>
        </div>
      </div>
    </section>
  `

  return htmlShell({
    title: c.seo?.title || `${c.businessName} - ${c.tagline}`,
    description: c.seo?.description || '',
    keywords: c.seo?.keywords || [],
    ogTitle: c.seo?.ogTitle || '',
    ogDescription: c.seo?.ogDescription || '',
    colors: c.colors,
    bodyContent,
    currentPage: '/index.html',
    pages,
    businessName: c.businessName,
    phone: c.phone,
  })
}

function generateAboutPage(c, pages) {
  const about = c.aboutPage || {}
  const values = about.values || []

  const valuesHtml = values.map(v => `
    <div class="reveal bg-gray-50 rounded-xl p-6 border border-gray-100">
      <h3 class="text-base font-semibold text-gray-900 mb-2">${escapeHtml(v.title)}</h3>
      <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(v.description)}</p>
    </div>
  `).join('')

  const storyParagraphs = (about.story || '').split('\n').filter(p => p.trim()).map(p =>
    `<p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(p)}</p>`
  ).join('')

  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3 animate-fade-up">About Us</p>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-8 animate-fade-up animate-delay-1">${escapeHtml(about.heading || 'Our Story')}</h1>
        <div class="prose prose-lg max-w-none animate-fade-up animate-delay-2">
          ${storyParagraphs || '<p class="text-gray-600 leading-relaxed">We are a locally owned and operated business committed to providing exceptional service to our community.</p>'}
        </div>
        ${about.team ? `<p class="text-gray-600 leading-relaxed mt-6">${escapeHtml(about.team)}</p>` : ''}
      </div>
    </section>

    ${values.length > 0 ? `
    <section class="py-20 px-4 sm:px-6 bg-white border-t border-gray-100">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Our Values</h2>
        <div class="grid md:grid-cols-2 gap-4">
          ${valuesHtml}
        </div>
      </div>
    </section>
    ` : ''}
  `

  return htmlShell({
    title: `About - ${c.businessName}`,
    description: `Learn about ${c.businessName}`,
    colors: c.colors,
    bodyContent,
    currentPage: '/about.html',
    pages,
    businessName: c.businessName,
    phone: c.phone,
  })
}

function generateServicesPage(c, pages) {
  const sp = c.servicesPage || {}
  const services = sp.services || c.homepage?.services || []

  const servicesHtml = services.map((s, i) => `
    <div class="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
      <div class="flex items-start gap-4 mb-4">
        <div class="text-2xl">${s.icon || '🔧'}</div>
        <h3 class="text-xl font-bold text-gray-900">${escapeHtml(s.name)}</h3>
      </div>
      <p class="text-gray-600 leading-relaxed mb-4">${escapeHtml(s.description)}</p>
      ${s.features ? `
      <ul class="flex flex-col gap-2">
        ${s.features.map(f => `
        <li class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          ${escapeHtml(f)}
        </li>`).join('')}
      </ul>` : ''}
    </div>
  `).join('')

  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3 animate-fade-up">Our Services</p>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 animate-fade-up animate-delay-1">${escapeHtml(sp.heading || 'What We Offer')}</h1>
          ${sp.intro ? `<p class="text-gray-600 mt-4 max-w-2xl mx-auto animate-fade-up animate-delay-2">${escapeHtml(sp.intro)}</p>` : ''}
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          ${servicesHtml}
        </div>
      </div>
    </section>

    <section class="py-20 px-4 sm:px-6 bg-primary text-white">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-6">Need our help?</h2>
        <p class="text-white/80 mb-8">Get in touch for a free quote. No obligation, no pressure.</p>
        <a href="/contact.html" class="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-bold transition-all hover:bg-gray-100">
          Contact Us Today
        </a>
      </div>
    </section>
  `

  return htmlShell({
    title: `Services - ${c.businessName}`,
    description: `Professional services from ${c.businessName}`,
    colors: c.colors,
    bodyContent,
    currentPage: '/services.html',
    pages,
    businessName: c.businessName,
    phone: c.phone,
  })
}

function generateContactPage(c, pages) {
  const contact = c.contactPage || {}

  const bodyContent = `
    <section class="py-20 md:py-28 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary uppercase tracking-wider mb-3 animate-fade-up">Get In Touch</p>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 animate-fade-up animate-delay-1">${escapeHtml(contact.heading || 'Contact Us')}</h1>
          ${contact.intro ? `<p class="text-gray-600 mt-4 max-w-2xl mx-auto animate-fade-up animate-delay-2">${escapeHtml(contact.intro)}</p>` : ''}
        </div>

        <div class="grid lg:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form class="flex flex-col gap-5" onsubmit="event.preventDefault(); alert('Thank you! We will be in touch shortly.')">
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input type="text" required class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" placeholder="Your name">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" placeholder="Your phone number">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" required class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" placeholder="your@email.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea rows="5" required class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none" placeholder="Tell us about your project..."></textarea>
              </div>
              <button type="submit" class="btn-primary px-8 py-3.5 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto">
                Send Message
              </button>
            </form>
          </div>

          <!-- Contact Info -->
          <div class="flex flex-col gap-6">
            <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Phone</p>
                    <p class="text-sm font-semibold text-gray-900">${c.phone !== 'placeholder' ? escapeHtml(c.phone) : 'Contact us for details'}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="text-sm font-semibold text-gray-900">${c.email !== 'placeholder' ? escapeHtml(c.email) : 'Contact us for details'}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Location</p>
                    <p class="text-sm font-semibold text-gray-900">${escapeHtml(c.address || 'Local area')}</p>
                  </div>
                </div>
              </div>
            </div>

            ${contact.hours ? `
            <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Opening Hours</h3>
              <p class="text-sm text-gray-600">${escapeHtml(contact.hours)}</p>
              ${contact.emergency ? '<p class="text-sm font-semibold text-primary mt-3">24/7 Emergency Service Available</p>' : ''}
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    </section>
  `

  return htmlShell({
    title: `Contact - ${c.businessName}`,
    description: `Contact ${c.businessName} for a free quote`,
    colors: c.colors,
    bodyContent,
    currentPage: '/contact.html',
    pages,
    businessName: c.businessName,
    phone: c.phone,
  })
}
