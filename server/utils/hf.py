import torch
import torchaudio
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC

# Load model and processor
model_name = "vitouphy/wav2vec2-xls-r-300m-timit-phoneme"
processor = Wav2Vec2Processor.from_pretrained(model_name)
model = Wav2Vec2ForCTC.from_pretrained(model_name)
model.eval()

# Load a sample audio file
# wav_file = "/Users/zwhitchcox/Documents/fff.wav"  # Replace with your test file path
wav_file = "output.wav"
audio, sample_rate = torchaudio.load(wav_file)
audio = audio / torch.abs(audio).max()

# Resample to 16kHz if necessary
if sample_rate != 16000:
    resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
    audio = resampler(audio)

# Preprocess audio
audio = audio.squeeze() / 32768.0  # Normalize to [-1, 1]

inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)

# Perform inference
with torch.no_grad():
    logits = model(inputs.input_values).logits

# Decode phonemes
predicted_ids = torch.argmax(logits, dim=-1)
phonemes = processor.batch_decode(predicted_ids)
print(f"Logits shape: {logits.shape}")  # Should be (batch_size, sequence_length, vocab_size)
print(f"Sample logits: {logits[0, :5, :5]}")  # Check the first few logits
print(processor.tokenizer.get_vocab())
print(f"Phonemes: {phonemes}")