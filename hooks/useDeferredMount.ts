import { useEffect, useState } from 'react'
import { InteractionManager } from 'react-native'

/**
 * Retorna `false` até que todas as animações e interações em curso terminem,
 * depois retorna `true`. Útil para adiar a montagem de componentes pesados
 * para após o primeiro frame visível, melhorando o tempo de resposta inicial.
 *
 * @param extraDelayMs - Atraso adicional (ms) após as interações finalizarem.
 */
export function useDeferredMount(extraDelayMs = 0): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (extraDelayMs > 0) {
        const t = setTimeout(() => setReady(true), extraDelayMs)
        return () => clearTimeout(t)
      }
      setReady(true)
    })
    return () => task.cancel()
  }, [extraDelayMs])

  return ready
}
