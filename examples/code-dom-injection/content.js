// Enable HMR if available
if (module.hot) {
  module.hot.accept()
}

// Main content script logic
console.log('hello from content_scripts')

document.body.innerHTML += `
  <style>
    .content_script {
      color: #c9c9c9;
      background-color: #0a0c10;
      position: fixed;
      right: 0;
      bottom: 0;
      z-index: 9;
      width: 315px;
      margin: 1rem;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
    }

    .content_title {
      font-size: 1.85em;
      line-height: 1.1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
      font-weight: 700;
    }
  </style>

  <div class="content_script">
    <h1 class="content_title">Welcome to your Content Script Extension</h1>
  </div>
`
