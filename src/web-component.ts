import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ImageUploader } from './upload/ImageUploader'
import { ImageGallery } from './gallery/ImageGallery'

class ImageUploaderElement extends HTMLElement {
  private root: Root | null = null

  private getProps() {
    return {
      apiBase: this.getAttribute('api-base') ?? '',
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
    return ['api-base', 'title-label']
  }

  attributeChangedCallback() {
    this.root?.render(React.createElement(ImageUploader, this.getProps()))
  }
}

if (!customElements.get('image-uploader')) {
  customElements.define('image-uploader', ImageUploaderElement)
}

class ImageGalleryElement extends HTMLElement {
  private root: Root | null = null

  private getProps() {
    return {
      project: this.getAttribute('project') ?? '',
      apiBase: this.getAttribute('api-base') ?? '',
    }
  }

  connectedCallback() {
    const container = document.createElement('div')
    this.appendChild(container)
    this.root = createRoot(container)
    this.root.render(React.createElement(ImageGallery, this.getProps()))
  }

  disconnectedCallback() {
    this.root?.unmount()
    this.root = null
  }

  static get observedAttributes() {
    return ['project', 'api-base']
  }

  attributeChangedCallback() {
    this.root?.render(React.createElement(ImageGallery, this.getProps()))
  }
}

if (!customElements.get('image-gallery')) {
  customElements.define('image-gallery', ImageGalleryElement)
}
