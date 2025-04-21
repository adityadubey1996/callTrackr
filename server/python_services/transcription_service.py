# services/transcription_service.py
import whisper
import pysrt
import os
from utils_python.audio_utils import AudioUtils

class TranscriptionService:
    def __init__(self, model_name='turbo'):
        self.model = whisper.load_model(model_name)

    def transcribe_audio(self, audio_file):
        result = self.model.transcribe(audio_file)
        return result['text'], result.get('segments', [])

    def save_srt(self, segments, srt_file):
        subs = pysrt.SubRipFile()
        for i, segment in enumerate(segments, start=1):
            start = self.seconds_to_srt_timestamp(segment['start'])
            end = self.seconds_to_srt_timestamp(segment['end'])
            text = segment['text']
            subs.append(pysrt.SubRipItem(index=i, start=start, end=end, text=text))
        subs.save(srt_file, encoding='utf-8')

    @staticmethod
    def seconds_to_srt_timestamp(seconds):
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)
        return pysrt.SubRipTime(hours, minutes, secs, millis)