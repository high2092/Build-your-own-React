import {serve} from 'bun'

serve({
  port: 3000,
  fetch(req) {
    if (req.url.endsWith('/') || req.url.endsWith('/index.html')) {
      return new Response(Bun.file('index.html'), {status: 200})
    }
    const url = new URL(req.url)

    const filePath = url.pathname.startsWith('/dist')
      ? `dist${url.pathname.replace('/dist', '')}`
      : `public${url.pathname}`

    try {
      const file = Bun.file(filePath)
      return new Response(file, {status: 200})
    } catch {
      return new Response('404 Not Found', {status: 404})
    }
  },
})
