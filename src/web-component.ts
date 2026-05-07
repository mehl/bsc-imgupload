import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ImageUploader } from './upload/ImageUploader'

class ImageUploaderElement extends HTMLElement {
  private root: Root | null = null

  private getProps() {
    return {
      apiUrl: this.getAttribute('api-url') ?? '/api/upload',
      titleLabel: this.getAttribute('title-label') ?? 'Titel',
    }
  }

  connectedCallback() {
    const container = document.createElement('div')
    this.appendChild(container)
    this.root = createRoot(container)
    this.root.render(React.createElement(ImageUploader, this.getProps()))
  }

  disconnectedCallback() {
    this.root?.unmount()
    this.root = null
  }

  static get observedAttributes() {
    return ['api-url', 'title-label']
  }

  attributeChangedCallback() {
    this.root?.render(React.createElement(ImageUploader, this.getProps()))
  }
}

if (!customElements.get('image-uploader')) {
  customElements.define('image-uploader', ImageUploaderElement)
}
