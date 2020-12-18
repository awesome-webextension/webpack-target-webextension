import { log } from './shared'

const ele = document.createElement('h1')
document.body.appendChild(ele)
ele.innerText = log()

module.hot.accept('./shared', () => {
  ele.innerText = log()
})
