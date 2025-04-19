import sys, os

# Remove the project root (and thus node_modules) from module search
project_root = os.getcwd()
if project_root in sys.path:
    sys.path.remove(project_root)

# Or more surgically, drop any node_modules/bson path
sys.path = [
    p for p in sys.path
    if not p.startswith(os.path.join(project_root, "node_modules", "bson"))
]

import os
import json
import argparse
from dotenv import load_dotenv
from python_services.file_downloader import FileDownloader
from python_services.transcription_service import TranscriptionService
from python_services.parameter_service import ParameterService
from python_services.summary_service import SummaryService
from python_services.audit_service import AuditService
from utils_python.audit_parameters import AuditParameters
from utils_python.audio_utils import AudioUtils
from datetime import datetime
from python_services.audio_service import AudioProcessor
from python_services.rag_testing import RAGProcessor
from utils_python.connect_db import connectDB
from python_services.validate_metric import validate_metrics_list
from python_services.metric_suggestions import MetricSuggester
from python_services.metric_process import MetricProcessor
# from config import Config
import logging

# Configure logging
logging.basicConfig(
    filename="worker_logs.log",
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
)


load_dotenv()


# python3 /Users/adityadubey/calltrackr/server/main.py --chunking /Users/adityadubey/calltrackr/server/transcriptions/testing_sales_call_20241231_222320.srt --fileId 6774212334d030b19ef2c385

# python3 /Users/adityadubey/calltrackr/server/main.py --metric_verify '{"name": "How many time the pricing was mentioned?", "type": "Yes/No"}'

# python3 /Users/adityadubey/callTrackr/server/main.py  --query 'summarize the file' --conversation_id '677b1326696ccdedabb29486'

#  python3 /Users/adityadubey/callTrackr/server/main.py --process_metric '{"id":1736337174003,"name":"Keyword Mentions: delhi","type":"Numeric","description":"Count how many times the keyword 'delhi' was mentioned (16 mentions)."}' --fileId '["677af6638cc87c193329750e"]'

class MainProcessor:
    def __init__(self):
        logging.info("Initializing MainProcessor.")
        self.groq_api_key = os.getenv("GROQ_API_KEY")
      
        self.downloader = FileDownloader()
        self.parameter_service = ParameterService()
        self.summary_service = SummaryService(api_key=self.groq_api_key)
        self.db_client = connectDB()["test"]
        self.metric_suggester = MetricSuggester(db=self.db_client)
        self.metric_processor = MetricProcessor(db=self.db_client)
    def download_file(self, file_url):
        downloaded_file = self.downloader.download_file(file_url)
        print(f"Downloaded file to: {downloaded_file}")
        return downloaded_file

    def convert_to_audio(self, video_file):
        audio_file = os.path.splitext(video_file)[0] + '.mp3'
        AudioUtils.convert_video_to_audio(video_file, audio_file)
        print(f"Converted video to audio: {audio_file}")
        return audio_file

    def transcribe_audio(self, audio_file):
        # Perform the transcription
        self.transcription_service = TranscriptionService(model_name='base')


        transcript, segments = self.transcription_service.transcribe_audio(audio_file)
        
        # Create a 'transcriptions' folder if it doesn't exist
        transcription_folder = "transcriptions"
        if not os.path.exists(transcription_folder):
            os.makedirs(transcription_folder)

        # Generate a unique filename with date and time
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_filename = os.path.splitext(os.path.basename(audio_file))[0]
        file_name =f"{base_filename}_{timestamp}"
        srt_file = os.path.abspath(os.path.join(transcription_folder, f"{file_name}.srt"))

        # Save the SRT file
        self.transcription_service.save_srt(segments, srt_file)
        # do not remove
        print(f"Transcription saved to: {srt_file}")
        
        # Save the transcript as a .txt file (optional)
        txt_file = os.path.abspath(os.path.join(transcription_folder, f"{file_name}.txt"))
        with open(txt_file, 'w') as f:
            f.write(transcript)
                    # do not remove

        print(f"Transcript saved to: {txt_file}")

        print(f"Transcription File Name: {file_name}.srt")
        
        return transcript, srt_file, txt_file, file_name
    
    def chunk_transcribe_audio(self, srt_file, file_id):
        """Chunk and process the provided SRT file."""
        if not srt_file:
            raise ValueError("SRT file path is required.")
        
        print(f"Processing and chunking SRT file: {srt_file}")
        self.audio_processor = AudioProcessor(self.db_client, file_id)

        self.audio_processor.process_audio_transcript(srt_file, file_id)

    def process_query(self, conversation_id, query):
        if not conversation_id:
            raise ValueError("conversation_id is required.")
        
        if not query:
            raise ValueError("query is required.")
        
        self.rag_processor = RAGProcessor(self.db_client,conversation_id,query)

        response = self.rag_processor.process()
        print('AI_RESPONSE:', response)
    def get_parameters(self):
        answers_str = self.parameter_service.get_parameters()
        audit_parameters = AuditParameters.determine_audit_parameters(answers_str)
        print("Audit Parameters:", audit_parameters)
        return audit_parameters

    def generate_summary(self, transcript, audit_parameters):
        existing_summary = "This is the existing summary of the transcript."
        summary_prompt = AuditParameters.generate_summary_prompt(audit_parameters, existing_summary, transcript)
        print(summary_prompt)
        summary = self.summary_service.generate_summary(summary_prompt)
        print("Generated Summary:", summary)
        return summary

    def generate_audit_report(self, audit_parameters, summary, audio_file):
        audit_service = AuditService(audit_parameters, summary)
        audit_report = audit_service.generate_audit_report()
        json_output = os.path.splitext(audio_file)[0] + '.json'
        with open(json_output, 'w') as f:
            json.dump(audit_report, f, indent=4)
        print(f"Audit report saved to: {json_output}")
        return json_output

    def create_metric_suggestions(self, file_id):
        """
        Generate metric suggestions for a given file ID.
        """
        try:
            suggestions = self.metric_suggester.suggest_metrics(file_id)
            # Print the result with a reference marker for stdout.match
            print(f"METRIC_SUGGESTIONS: {json.dumps(suggestions, indent=4)}")
        except Exception as e:
            error_result = {"error": str(e)}
            print(f"METRIC_SUGGESTIONS: {json.dumps(error_result, indent=4)}")

    def process_metrics(self, fileId, metric):
        """
        Generate metric suggestions for a given file ID.
        """
        try:
            suggestions = self.metric_processor.process_metric(file_ids = fileId, metric=metric)
            # Print the result with a reference marker for stdout.match
            print(f"PROCESS_METRIC_RESULT: {json.dumps(suggestions, indent=4)}")
        except Exception as e:
            error_result = {"error": str(e)}
            print(f"PROCESS_METRIC_ERROR: {json.dumps(error_result, indent=4)}")



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process and analyze audio/video files.")
    parser.add_argument("--download", type=str, help="URL of the file to download.")
    parser.add_argument("--convert", type=str, help="Path to the video file to convert to audio.")
    parser.add_argument("--transcribe", type=str, help="Path to the audio file to transcribe.")
    parser.add_argument("--chunking", type=str, help="chunk the srt file for RAG")
    parser.add_argument("--fileId", type=str, help="File ID from the database.")
    parser.add_argument("--query", type=str, help="query by the user for chat")
    parser.add_argument("--conversation_id", type=str, help="conversation_id the user for chat")
    parser.add_argument("--parameters", action="store_true", help="Extract audit parameters.")
    parser.add_argument("--summary", type=str, help="Generate a summary from a transcript file.")
    parser.add_argument("--audit", type=str, help="Generate an audit report from a transcript.")
    parser.add_argument("--metric_verify", type=str, help="validate the metric and data type from llm")
    parser.add_argument("--create_metric_suggestions", type=str, help="Generate metric suggestions for a file.")
    parser.add_argument("--process_metric", type=str, help="Metric processing for a file")

    args = parser.parse_args()
    processor = MainProcessor()

    try:
        if args.download:
            processor.download_file(args.download)

        if args.convert:
            processor.convert_to_audio(args.convert)

        if args.transcribe:
            processor.transcribe_audio(args.transcribe)

        if args.chunking:
            processor.chunk_transcribe_audio(args.chunking, args.fileId)

        if args.query:
            processor.process_query(args.conversation_id, args.query)

        if args.parameters:
            processor.get_parameters()

        if args.summary:
            with open(args.summary, 'r') as f:
                transcript = f.read()
            audit_parameters = processor.get_parameters()
            processor.generate_summary(transcript, audit_parameters)

        if args.audit:
            with open(args.audit, 'r') as f:
                transcript = f.read()
            audit_parameters = processor.get_parameters()
            summary = processor.generate_summary(transcript, audit_parameters)
            processor.generate_audit_report(audit_parameters, summary, args.audit)
        
        if args.metric_verify:
         

            try:
                metric = json.loads(args.metric_verify)
                print('metric', metric)
                result = validate_metrics_list(metric)
                # Print the result with a reference marker
                print(f"VALIDATION_RESULT: {json.dumps(result, indent=4)}")
            except json.JSONDecodeError:
                error_result = {"valid": False, "message": "Invalid JSON input."}
                print(f"VALIDATION_RESULT: {json.dumps(error_result, indent=4)}")
            except Exception as e:
                error_result = {"valid": False, "message": str(e)}
                print(f"VALIDATION_RESULT: {json.dumps(error_result, indent=4)}")

        if args.create_metric_suggestions:
            processor.create_metric_suggestions(args.create_metric_suggestions)

        if args.process_metric:
            try:
                print('metric',args.process_metric)
                print('file_ids',args.fileId)
                file_ids = json.loads(args.fileId)  # Parse file IDs as a list of strings
                print('file_ids after', file_ids)
                metric = json.loads(args.process_metric)
                print('process_metric after', metric)
                  # Ensure file_ids is a list
                if not isinstance(file_ids, list) or not all(isinstance(fid, str) for fid in file_ids):
                    raise ValueError("file_ids must be a list of strings.")

                # Ensure metric is a dictionary with required keys
                if not isinstance(metric, dict) or not all(k in metric for k in ("id", "name", "type")):
                    raise ValueError("metric must be a dictionary with 'id', 'name', and 'type' keys.")
                

                print('metric',metric)
                print('file_ids',file_ids)
                # raise ValueError('testing')
                result = processor.process_metrics(fileId=file_ids, metric=metric)
            except Exception as e:
                error_result = {"valid": False, "message": str(e)}
                print(f"PROCESS_METRIC: {json.dumps(error_result, indent=4)}")


            
    except Exception as e:
        print(f"An error occurred: {e}")