import { render } from 'react-dom'
import { App } from './App'

setTimeout(initial, 1000)
function initial() {
    const root = document.createElement('div')
    root.style.position = 'fixed'
    root.style.right = '24px'
    root.style.bottom = '24px'
    root.style.width = '400px'
    root.style.height = '250px'
    root.style.border = '1px solid green'
    document.body.appendChild(root)
    render(<App />, root)
}
