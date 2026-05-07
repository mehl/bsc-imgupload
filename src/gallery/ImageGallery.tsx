import { useEffect, useState } from 'react'
import type { GalleryData } from './types'
import { SetItem } from './SetItem'

type Props = {
    project: string
    apiUrl?: string
}

export function ImageGallery({ project, apiUrl = '/api/gallery' }: Props) {
    const [data, setData] = useState<GalleryData | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!project) return
        setData(null)
        setError(null)
        fetch(`${apiUrl}/${project}`)
            .then(r => r.ok ? r.json() as Promise<GalleryData> : Promise.reject(r.statusText))
            .then(setData)
            .catch(e => setError(String(e)))
    }, [project, apiUrl])

    if (error) return <p className="text-danger small">{error}</p>
    if (!data) return <p className="text-muted small">Lade…</p>
    if (!data.sets.length) return <p className="text-muted small">Keine Bilder vorhanden.</p>

    return (
        <div>
            {data.sets.map(set => (
                <SetItem key={set.id} set={set} />
            ))}
        </div>
    )
}
