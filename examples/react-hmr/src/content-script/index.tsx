import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'

let unmount: () => void
import.meta.webpackHot?.accept()
import.meta.webpackHot?.dispose(() => unmount?.())

console.log('Extension running!')

if (document.readyState === 'complete') unmount = initial()
else
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete') unmount = initial()
  })

function initial() {
  const root = document.createElement('div')
  const shadow = root.attachShadow({ mode: 'open' })
  document.body.appendChild(root)

  const style = new CSSStyleSheet()
  shadow.adoptedStyleSheets = [style]
  fetchCSS().then((response) => style.replace(response))

  import.meta.webpackHot?.accept('./style.css', () => {
    fetchCSS().then((response) => style.replace(response))
  })

  const mountingPoint = createRoot(shadow)
  mountingPoint.render(<App />)
  return () => {
    mountingPoint.unmount()
    root.remove()
  }
}

async function fetchCSS() {
  const response = await fetch(new URL('./style.css', import.meta.url))
  return response.ok ? response.text() : Promise.reject(response.text())
}
