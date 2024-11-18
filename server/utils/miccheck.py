import soundfile as sf
import torch
import torchaudio
import sounddevice as sd
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

# Load the pre-trained model and processor
model_name = "facebook/wav2vec2-lv-60-espeak-cv-ft"
processor = Wav2Vec2Processor.from_pretrained(model_name)
model = Wav2Vec2ForCTC.from_pretrained(model_name)

# Set model to evaluation mode
model.eval()

FILENAME = "output.wav"  # Output file name
DURATION = 5  # Duration of the recording in seconds
SAMPLE_RATE = 16000  # Sample rate in Hz

def record_audio():
    print(f"Recording for {DURATION} seconds...")
    # Record audio
    audio_data = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16')
    sd.wait()  # Wait until the recording is finished

    # Save the audio to a file
    sf.write(FILENAME, audio_data, SAMPLE_RATE)
    print(f"Audio recorded and saved to {FILENAME}")

def main():
    record_audio()

if __name__ == "__main__":
    main()
