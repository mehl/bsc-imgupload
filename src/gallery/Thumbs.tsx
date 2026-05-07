import type { GalleryImage } from './types'

type Props = {
    images: GalleryImage[]
    onImageClick: (index: number) => void
}

export function Thumbs({ images, onImageClick }: Props) {
    return (
        <div className="row row-cols-3 row-cols-sm-4 row-cols-md-6 g-1">
            {images.map((img, index) => (
                <div key={img.id} className="col">
                    <a
                        href={img.large}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => { e.preventDefault(); onImageClick(index) }}
                        style={{ display: 'block', cursor: 'zoom-in' }}
                    >
                        <img
                            src={img.thumb}
                            alt={img.originalName}
                            loading="lazy"
                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                        />
                    </a>
                </div>
            ))}
        </div>
    )
}
