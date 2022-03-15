import './options.css'
import { render } from 'react-dom'
import { App } from './App'

setTimeout(initial, 1000)
function initial() {
  const root = document.createElement('div')
  document.body.appendChild(root)
  render(<App />, root)
}
