import { run } from 'remix/ui'

run({
  async loadModule(moduleUrl, exportName) {
    let mod = await import(moduleUrl)
    return mod[exportName]
  },
  async resolveFrame(src, signal, target) {
    let headers = new Headers({ accept: 'text/html' })
    if (target) headers.set('x-remix-target', target)

    let response = await fetch(src, {
      credentials: 'same-origin',
      headers,
      signal,
    })
    return response.body ?? response.text()
  },
})

for (let element of document.querySelectorAll<HTMLElement>('[data-series-events]')) {
  let src = element.dataset.seriesEvents
  if (!src) continue

  let statusElement = element.querySelector<HTMLElement>('[data-series-status]')
  let source = new EventSource(src)

  source.addEventListener('status', (event) => {
    let data = JSON.parse((event as MessageEvent).data) as {
      status?: string
      message?: string | null
    }
    if (statusElement && data.message) statusElement.textContent = data.message
    if (data.status === 'complete' || data.status === 'failed') {
      source.close()
      window.location.reload()
    }
  })
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

const microphoneIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"></path>
    <path d="M19 11a7 7 0 0 1-14 0"></path>
    <path d="M12 18v4"></path>
    <path d="M8 22h8"></path>
  </svg>
`

const spinnerIcon = '<span class="dictation-spinner" aria-hidden="true"></span>'
type DictationButtonState = 'idle' | 'recording' | 'transcribing'

function createDictationWaveform() {
  let container = document.createElement('div')
  container.className = 'dictation-waveform'
  container.hidden = true
  container.setAttribute('aria-hidden', 'true')

  let bars = Array.from({ length: 18 }, () => {
    let bar = document.createElement('span')
    container.append(bar)
    return bar
  })

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let frameId = 0

  function resetBars() {
    bars.forEach((bar, index) => {
      let height = 0.18 + (index % 5) * 0.07
      bar.style.transform = `scaleY(${height})`
    })
  }

  function stop() {
    if (frameId) cancelAnimationFrame(frameId)
    frameId = 0
    void audioContext?.close()
    audioContext = null
    analyser = null
    container.hidden = true
    container.classList.remove('active')
    resetBars()
  }

  function animate() {
    if (!analyser) return
    let data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(data)
    let chunkSize = Math.max(1, Math.floor(data.length / bars.length))

    bars.forEach((bar, index) => {
      let start = index * chunkSize
      let total = 0
      for (let offset = 0; offset < chunkSize; offset += 1) {
        let value = (data[start + offset] ?? 128) - 128
        total += Math.abs(value)
      }
      let level = total / chunkSize / 64
      bar.style.transform = `scaleY(${Math.min(1, 0.18 + level)})`
    })

    frameId = requestAnimationFrame(animate)
  }

  async function start(stream: MediaStream) {
    container.hidden = false
    container.classList.add('active')
    resetBars()

    try {
      let AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext
      audioContext = new AudioContextConstructor()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      audioContext.createMediaStreamSource(stream).connect(analyser)
      animate()
    } catch {
      resetBars()
    }
  }

  resetBars()
  return { element: container, start, stop }
}

function setupDictationButtons(root: ParentNode = document) {
  let textareas =
    root instanceof HTMLTextAreaElement
      ? [root]
      : Array.from(root.querySelectorAll<HTMLTextAreaElement>('textarea'))

  for (let textarea of textareas) {
    if (textarea.dataset.dictationReady === 'true') continue
    textarea.dataset.dictationReady = 'true'

    let button = document.createElement('button')
    button.type = 'button'
    button.className = 'dictation-button'
    button.dataset.dictationButton = 'true'
    button.innerHTML = microphoneIcon
    button.setAttribute('aria-label', 'Start dictation')
    button.title = 'Start dictation'
    button.setAttribute('aria-pressed', 'false')

    let controls = document.createElement('div')
    controls.className = 'dictation-controls'
    let waveform = createDictationWaveform()
    let status = document.createElement('span')
    status.className = 'dictation-status'
    status.hidden = true
    status.setAttribute('role', 'status')
    status.setAttribute('aria-live', 'polite')
    controls.append(button, waveform.element, status)

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      button.disabled = true
      button.title = 'Audio recording is not supported in this browser.'
      status.textContent = 'Audio recording is not supported in this browser.'
      status.hidden = false
      textarea.insertAdjacentElement('afterend', controls)
      continue
    }

    let recorder: MediaRecorder | null = null
    let stream: MediaStream | null = null
    let chunks: Blob[] = []
    let audioFileName = 'dictation.webm'
    let buttonState: DictationButtonState = 'idle'

    function setStatus(message = '') {
      status.textContent = message
      status.hidden = !message
    }

    function setButtonState(state: DictationButtonState) {
      buttonState = state
      button.classList.toggle('listening', state === 'recording')
      button.classList.toggle('transcribing', state === 'transcribing')
      button.disabled = state === 'transcribing'
      button.innerHTML = state === 'transcribing' ? spinnerIcon : microphoneIcon
      button.setAttribute(
        'aria-label',
        state === 'recording'
          ? 'Stop dictation'
          : state === 'transcribing'
            ? 'Transcribing dictation'
            : 'Start dictation',
      )
      button.title =
        state === 'recording'
          ? 'Stop dictation'
          : state === 'transcribing'
            ? 'Transcribing'
            : 'Start dictation'
      button.setAttribute('aria-pressed', String(state === 'recording'))
    }

    function stopStream() {
      stream?.getTracks().forEach((track) => track.stop())
      stream = null
    }

    function appendTranscript(text: string) {
      let transcript = text.trim()
      if (!transcript) return
      let separator = textarea.value.trim() && !/\s$/.test(textarea.value) ? ' ' : ''
      textarea.value = `${textarea.value}${separator}${transcript}`
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      setStatus('')
    }

    async function transcribeRecording(audio: Blob) {
      setButtonState('transcribing')
      waveform.stop()
      stopStream()
      if (audio.size === 0) {
        setStatus('No audio was recorded.')
        setButtonState('idle')
        return
      }

      try {
        let formData = new FormData()
        formData.append('audio', audio, audioFileName)
        let response = await fetch('/story-app/dictation', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            accept: 'application/json',
          },
          body: formData,
        })
        let result = (await response.json()) as { text?: unknown; error?: unknown }
        if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Transcription failed.')
        if (typeof result.text !== 'string') throw new Error('Transcription response did not include text.')
        if (result.text.trim()) {
          appendTranscript(result.text)
        } else {
          setStatus('No speech detected.')
        }
      } catch (error) {
        console.error('Dictation transcription failed.', error)
        setStatus('Transcription failed. Try again.')
      } finally {
        setButtonState('idle')
      }
    }

    function stopRecording() {
      if (recorder && recorder.state !== 'inactive') {
        setButtonState('transcribing')
        waveform.stop()
        try {
          recorder.requestData()
        } catch {
          // Some browsers do not allow requestData while stopping; stop still flushes.
        }
        try {
          recorder.stop()
        } catch (error) {
          console.error('Audio recording stop failed.', error)
          recorder = null
          setStatus('Microphone recording failed.')
          setButtonState('idle')
          stopStream()
        }
        return
      }
      setButtonState('idle')
      waveform.stop()
      stopStream()
    }

    async function startRecording() {
      if (buttonState !== 'idle') return
      try {
        setStatus('')
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        chunks = []
        let mimeType =
          [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/mp4;codecs=mp4a.40.2',
          ].find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
        audioFileName = mimeType.includes('mp4') ? 'dictation.mp4' : 'dictation.webm'
        let activeRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
        recorder = activeRecorder
        activeRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) chunks.push(event.data)
        })
        activeRecorder.addEventListener('stop', () => {
          let audio = new Blob(chunks, { type: activeRecorder.mimeType || mimeType || 'audio/webm' })
          chunks = []
          recorder = null
          void transcribeRecording(audio)
        })
        setButtonState('recording')
        void waveform.start(stream)
        activeRecorder.start()
      } catch (error) {
        console.error('Audio recording failed.', error)
        setStatus('Microphone recording failed.')
        setButtonState('idle')
        waveform.stop()
        stopStream()
      }
    }

    button.addEventListener('click', () => {
      if (buttonState === 'transcribing') return
      if (recorder && recorder.state === 'recording') {
        stopRecording()
        return
      }

      void startRecording()
    })

    textarea.insertAdjacentElement('afterend', controls)
  }
}

setupDictationButtons()
new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node instanceof Element) setupDictationButtons(node)
    }
  }
}).observe(document.body, { childList: true, subtree: true })
