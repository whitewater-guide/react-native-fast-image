import {
    EmitterSubscription,
    NativeEventEmitter,
    NativeModules,
} from 'react-native'
import {
    PreloadCompletionHandler,
    PreloadProgressHandler,
    Source,
} from './index'
const nativeManager = NativeModules.FastImagePreloaderManager
const nativeEmitter = new NativeEventEmitter(nativeManager)

interface NativeProgressEvent {
    id: number
    finished: number
    total: number
    url: string
}

interface NativeCompleteEvent {
    id: number
    finished: number
    skipped: number
}

interface NativeInstance {
    urls: string[]
    onProgress?: PreloadProgressHandler
    onComplete?: PreloadCompletionHandler
}

class PreloaderManager {
    _instances = new Map<number, NativeInstance>()
    _subProgress: EmitterSubscription | null = null
    _subComplete: EmitterSubscription | null = null

    preload = (
        sources: Source[],
        onProgress?: PreloadProgressHandler,
        onComplete?: PreloadCompletionHandler,
    ) => {
        nativeManager.createPreloader().then((id: number) => {
            if (this._instances.size === 0) {
                this._subProgress = nativeEmitter.addListener(
                    'fffastimage-progress',
                    this.onProgress,
                )
                this._subComplete = nativeEmitter.addListener(
                    'fffastimage-complete',
                    this.onComplete,
                )
            }
            this._instances.set(id, { onProgress, onComplete, urls: [] })
            nativeManager.preload(id, sources)
        })
    }

    onProgress = ({ id, finished, total, url }: NativeProgressEvent) => {
        const instance = this._instances.get(id)
        if (!instance) {
            throw new Error(
                `Preloader instance with id '${id}' is not registered`,
            )
        }
        // null is returned when url failed to load
        if (url) {
            instance.urls = [...instance.urls, url]
        }
        instance.onProgress?.(instance.urls, finished, total)
    }

    onComplete = ({ id, finished, skipped }: NativeCompleteEvent) => {
        const instance = this._instances.get(id)
        if (!instance) {
            throw new Error(
                `Preloader instance with id '${id}' is not registered`,
            )
        }
        const { onComplete, urls } = instance
        onComplete?.(urls, finished, skipped)
        this._instances.delete(id)
        if (this._instances.size === 0) {
            this._subProgress?.remove()
            this._subComplete?.remove()
        }
    }
}

export default new PreloaderManager()
