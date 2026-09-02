import { useEffect, useRef } from 'react'

// Trilha de fundo gerada na hora pela Web Audio API, nota a nota. Não é um
// arquivo de música: a trilha dos filmes é obra protegida, e um mp3 de três
// minutos pesaria mais que o site inteiro.
//
// O material é uma pentatônica de Lá menor tocada devagar, uma nota a cada dois
// segundos, com um acorde grave sustentando por baixo. Pentatônica porque nela
// não tem intervalo dissonante, então qualquer nota sorteada combina com a
// anterior.
//
// Só começa depois de um gesto do visitante (o navegador bloqueia áudio
// automático), entra em rampa e, ao desligar, o grafo inteiro é desmontado.

// Lá menor pentatônica em três oitavas, em hertz.
const SCALE = [
  220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5,
]

// O acorde de baixo: fundamental e quinta, duas oitavas abaixo.
const DRONE = [110.0, 164.81]

interface AmbienceOptions {
  enabled: boolean
  /** Volume geral, de 0 a 1. */
  volume?: number
}

export function useAmbience({ enabled, volume = 0.22 }: AmbienceOptions) {
  // Um grafo só por sessão. O ref guarda o que precisa ser desmontado quando
  // desligar ou sair da página.
  const graph = useRef<{
    context: AudioContext
    master: GainNode
    timer: number
    voices: Array<{ oscillator: OscillatorNode; gain: GainNode }>
  } | null>(null)

  useEffect(() => {
    if (!enabled) return

    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextClass) return

    let context: AudioContext
    try {
      context = new AudioContextClass()
    } catch {
      return
    }

    const master = context.createGain()
    master.gain.value = 0
    master.connect(context.destination)

    // Passa-baixa para tirar o brilho e deixar o som parecendo vindo de outra
    // sala.
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1800
    filter.Q.value = 0.6
    filter.connect(master)

    const voices: Array<{ oscillator: OscillatorNode; gain: GainNode }> = []

    // Acorde grave contínuo, com as duas vozes um pouco desafinadas entre si
    // para o som não ficar parado.
    for (const [index, frequency] of DRONE.entries()) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.detune.value = index === 0 ? -4 : 5
      gain.gain.value = 0.16

      oscillator.connect(gain)
      gain.connect(filter)
      oscillator.start()

      voices.push({ oscillator, gain })
    }

    // Uma nota: ataque curto e cauda longa.
    function pluck(frequency: number, at: number) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'triangle'
      oscillator.frequency.value = frequency

      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.32, at + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 3.4)

      oscillator.connect(gain)
      gain.connect(filter)
      oscillator.start(at)
      oscillator.stop(at + 3.6)
    }

    // Sorteia a próxima nota preferindo passos curtos. Salto grande soa
    // aleatório demais.
    let cursor = 4

    function step() {
      const jump = Math.floor(Math.random() * 5) - 2
      cursor = Math.min(SCALE.length - 1, Math.max(0, cursor + jump))

      const now = context.currentTime
      pluck(SCALE[cursor], now)

      // Metade das vezes toca uma segunda nota, uma terça acima.
      if (Math.random() > 0.5 && cursor + 2 < SCALE.length) pluck(SCALE[cursor + 2], now + 0.42)
    }

    // Entrada em rampa de quatro segundos.
    master.gain.setValueAtTime(0.0001, context.currentTime)
    master.gain.exponentialRampToValueAtTime(volume, context.currentTime + 4)

    step()
    const timer = window.setInterval(step, 2400)

    graph.current = { context, master, timer, voices }

    return () => {
      window.clearInterval(timer)

      // Saída em rampa também: cortar o oscilador no meio da onda estala.
      try {
        master.gain.cancelScheduledValues(context.currentTime)
        master.gain.setValueAtTime(master.gain.value, context.currentTime)
        master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.6)
      } catch {
        // Contexto já fechado, não tem o que desligar.
      }

      window.setTimeout(() => {
        for (const voice of voices) {
          try {
            voice.oscillator.stop()
          } catch {
            // Já parado.
          }
        }
        void context.close().catch(() => undefined)
      }, 700)

      graph.current = null
    }
  }, [enabled, volume])
}
