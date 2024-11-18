from vosk import Model, KaldiRecognizer
import wave
import json

# Load Vosk phoneme model
model = Model("vosk-model-small-en-us-phoneme")  # Replace with your phoneme model path

# Open the WAV file
wf = wave.open("eff.wav", "rb")
rec = KaldiRecognizer(model, wf.getframerate())

# Process the audio
while True:
    data = wf.readframes(4000)
    if len(data) == 0:
        break
    if rec.AcceptWaveform(data):
        result = rec.Result()
        print(json.loads(result))  # Output phoneme transcription