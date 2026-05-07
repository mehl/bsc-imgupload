export type GalleryImage = {
    id: string
    originalName: string
    uploadedAt: string
    thumb: string
    large: string
}

export type GallerySet = {
    id: string
    title: string | null
    timestamp: string
    images: GalleryImage[]
}

export type GalleryData = {
    projectHandle: string
    sets: GallerySet[]
}
