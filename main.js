document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header')

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60)
  })

  document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(link.getAttribute('href'))
      const main = document.querySelector('main')

      main.classList.add('fade-out')

      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' })
        main.classList.remove('fade-out')
      }, 300)
    })
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

  document.querySelectorAll('.video-card').forEach((card) => {
    const id = card.dataset.videoId
    const img = card.querySelector('img')

    img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`

    card.addEventListener('click', () => {
      window.open(`https://www.youtube.com/watch?v=${id}`, '_blank')
    })
  })

  window.addEventListener('load', () => {
    const video = document.querySelector('.hero-bg')
    if (!video) return

    video.muted = true
    const playPromise = video.play()

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.warn('Autoplay bloqueado, usando fallback')
      })
    }
  })
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  if (isMobile) {
    const video = document.querySelector('.hero-bg')
    if (video) video.remove()
  }

  // Agenda
  fetch('./data/agenda.json')
    .then((res) => res.json())
    .then((data) => renderAgenda(data))
    .catch(() => {
      document.getElementById('agenda-list').innerHTML =
        '<li>Agenda indisponível.</li>'
    })

  function todayAsComparable() {
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = now.getFullYear()
    return `${y}${m}${d}`
  }

  function parseDate(date) {
    const [day, month, year] = date.split('/')
    return `${year}${month}${day}`
  }

  function renderAgenda(events) {
    const container = document.getElementById('agenda-list')

    const hoje = todayAsComparable()

    const futuros = events
      .filter((e) => parseDate(e.date) >= hoje)
      .sort((a, b) => parseDate(a.date).localeCompare(parseDate(b.date)))

    if (!futuros.length) {
      container.innerHTML = '<li>Nenhuma data anunciada.</li>'
      return
    }

    const highlightId = futuros[0].id

    container.innerHTML = futuros
      .map(
        (event) => `
      <li class="agenda-item ${event.id === highlightId ? 'highlight' : ''}">
        <span class="agenda-date">
          ${formatDate(event.date)}
        </span>

        <div class="agenda-info">
          <strong>${event.city}</strong>
          <span>${event.venue}</span>
        </div>

        ${
          event.ticketUrl
            ? `<a href="${event.ticketUrl}" target="_blank">Ingressos</a>`
            : ''
        }
      </li>
    `
      )
      .join('')
  }

  function parseDate(date) {
    const [day, month, year] = date.split('/')
    return `${year}${month}${day}`
  }

  function formatDate(date) {
    const [day, month, year] = date.split('/')

    const meses = [
      'JAN',
      'FEV',
      'MAR',
      'ABR',
      'MAI',
      'JUN',
      'JUL',
      'AGO',
      'SET',
      'OUT',
      'NOV',
      'DEZ',
    ]

    return `${day} ${meses[Number(month) - 1]}`
  }

  const container = document.querySelector('.sobre-foto')
  const img = container.querySelector('img')
  const canvas = container.querySelector('canvas')
  const ctx = canvas.getContext('2d')

  const colorImage = new Image()
  colorImage.src = img.src

  function resize() {
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight

    drawMask()
  }

  function drawMask() {
    // limpa
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // desenha imagem colorida
    ctx.drawImage(colorImage, 0, 0, canvas.width, canvas.height)

    // cobre tudo com máscara
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.globalCompositeOperation = 'destination-out'
  }

  colorImage.onload = resize
  window.addEventListener('resize', resize)

  // brush orgânico acumulativo
  function reveal(x, y) {
    for (let i = 0; i < 6; i++) {
      const radius = 18 + Math.random() * 14
      const ox = (Math.random() - 0.5) * 20
      const oy = (Math.random() - 0.5) * 20

      ctx.beginPath()
      ctx.arc(x + ox, y + oy, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // mouse
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    reveal(x, y)
  })

  // touch
  container.addEventListener(
    'touchmove',
    (e) => {
      const rect = container.getBoundingClientRect()
      const touch = e.touches[0]

      reveal(touch.clientX - rect.left, touch.clientY - rect.top)
    },
    { passive: true }
  )
})
