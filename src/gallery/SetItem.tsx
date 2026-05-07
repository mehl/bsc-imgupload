import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import type { GallerySet } from './types'
import { Thumbs } from './Thumbs'

export function SetItem({ set }: { set: GallerySet }) {
    const [lightboxIndex, setLightboxIndex] = useState(-1)

    const slides = set.images.map(img => ({ src: img.large }))

    return (
        <div className="mb-4">
            {set.title && (
                <p className="text-muted small mb-1">{set.title}</p>
            )}
            <Thumbs images={set.images} onImageClick={setLightboxIndex} />
            <Lightbox
                open={lightboxIndex >= 0}
                index={lightboxIndex}
                close={() => setLightboxIndex(-1)}
                slides={slides}
                plugins={[Zoom]}
            />
        </div>
    )
}
