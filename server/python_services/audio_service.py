

# import os
# import psutil
# import logging
# from datetime import datetime
# from srt import parse
# from sentence_transformers import SentenceTransformer
# from transformers import pipeline
# from bson import ObjectId



# class AudioProcessor:
#     def __init__(self, db_client,file_id,  batch_size=20):
#         # Define the log file path relative to the current file
#         log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs", f"audio_processor_{file_id}.log")

#         # Ensure the logs directory exists
#         os.makedirs(os.path.dirname(log_file), exist_ok=True)

#         # Configure logging
#         logging.basicConfig(
#             filename=log_file,
#             level=logging.DEBUG,
#             format="%(asctime)s [%(levelname)s] %(message)s",
#         )

#         # Test log message
#         logging.info("Logging setup completed successfully.")
#         print(f"Log file path: {log_file}")

#         self.db_client = db_client
#         self.embedder = SentenceTransformer('all-mpnet-base-v2')
#         self.summarizer = pipeline('summarization', model="facebook/bart-large-cnn")
#         self.sentiment_analyzer = pipeline("sentiment-analysis")  
#         self.batch_size = batch_size
#         print(f"[INIT] AudioProcessor initialized with batch_size={batch_size}.")
#         logging.info(f"AudioProcessor initialized with batch_size={batch_size}.")

#     def log_memory_usage(self, prefix=""):
#         process = psutil.Process(os.getpid())
#         memory = process.memory_info().rss / (1024 * 1024)
#         print(f"{prefix}[MEMORY] Usage: {memory:.2f} MB")
#         logging.debug(f"{prefix}[MEMORY] Usage: {memory:.2f} MB")

#     def parse_srt_in_batches(self, file_path, batch_size):
#         print(f"[PARSE] Parsing SRT file in batches from: {file_path}")
#         logging.info(f"Parsing SRT file in batches from: {file_path}")
#         with open(file_path, 'r') as file:
#             subtitles = list(parse(file.read()))
#             for i in range(0, len(subtitles), batch_size):
#                 batch = subtitles[i:i + batch_size]
#                 parsed_batch = [
#                     {"start_time": str(sub.start), "end_time": str(sub.end), "text": sub.content}
#                     for sub in batch
#                 ]
#                 print(f"[PARSE] Yielding batch {i // batch_size + 1} with size {len(parsed_batch)}.")
#                 logging.info(f"Yielding batch {i // batch_size + 1} with size {len(parsed_batch)}.")
#                 yield parsed_batch

#     # def chunk_transcript(self, transcript, chunk_size=100, overlap_size=50):
#     #     print(f"[CHUNK] chunk_size={chunk_size}, overlap_size={overlap_size}")
#     #     logging.info(f"chunk_size={chunk_size}, overlap_size={overlap_size}")
#     #     chunks = []
#     #     current_chunk = []
#     #     current_size = 0
#     #     overlap_segments = []  # Store segments for the next chunk's overlap

#     #     for segment in transcript:
#     #         # Validate segment format
#     #         if 'text' not in segment or 'start_time' not in segment or 'end_time' not in segment:
#     #             raise ValueError(f"Invalid segment format: {segment}")

#     #         segment_tokens = segment['text'].split(" ")
#     #         current_chunk.append(segment)
#     #         current_size += len(segment_tokens)

#     #         print(f"[CHUNK] Current size: {current_size} / {chunk_size}")
#     #         logging.debug(f"Current size: {current_size} / {chunk_size}")

#     #         # If current chunk exceeds the size, create a new chunk
#     #         if current_size >= chunk_size:
#     #             print(f"[CHUNK] Finalizing chunk at size {current_size}.")
#     #             logging.info(f"Finalizing chunk at size {current_size}.")
#     #             chunks.append({
#     #                 "text": " ".join([seg["text"] for seg in overlap_segments + current_chunk]),
#     #                 "start_time": (overlap_segments + current_chunk)[0]["start_time"],
#     #                 "end_time": current_chunk[-1]["end_time"],
#     #             })

#     #             # Save overlap segments for the next chunk
#     #             overlap_segments = current_chunk[-overlap_size:]
#     #             current_chunk = []  # Reset current chunk
#     #             current_size = 0

#     #     # Add the remaining chunk if any
#     #     if current_chunk:
#     #         chunks.append({
#     #             "text": " ".join([seg["text"] for seg in overlap_segments + current_chunk]),
#     #             "start_time": (overlap_segments + current_chunk)[0]["start_time"],
#     #             "end_time": current_chunk[-1]["end_time"],
#     #         })
#     #     print(f"[CHUNK] Created {len(chunks)} chunks.")
#     #     logging.info(f"Created {len(chunks)} chunks.")
#     #     return chunks

#     def chunk_transcript(self, transcript, chunk_size=100, overlap_size=50):
#         print(f"[CHUNK] chunk_size={chunk_size}, overlap_size={overlap_size}")
#         logging.info(f"chunk_size={chunk_size}, overlap_size={overlap_size}")
#         chunks = []
#         current_chunk = []
#         current_size = 0
#         overlap_segments = []  # Store segments for the next chunk's overlap

#         for segment in transcript:
#             # Validate segment format
#             if 'text' not in segment or 'start_time' not in segment or 'end_time' not in segment:
#                 raise ValueError(f"Invalid segment format: {segment}")

#             segment_tokens = segment['text'].split(" ")
#             current_chunk.append(segment)
#             current_size += len(segment_tokens)

#             print(f"[CHUNK] Current size: {current_size} / {chunk_size}")
#             logging.debug(f"Current size: {current_size} / {chunk_size}")

#             # If current chunk exceeds the size, create a new chunk
#             if current_size >= chunk_size:
#                 print(f"[CHUNK] Finalizing chunk at size {current_size}.")
#                 logging.info(f"Finalizing chunk at size {current_size}.")
#                 all_segments = overlap_segments + current_chunk

#                 # NEW: We store not just the combined text, but also the original segments.
#                 chunks.append({
#                     "text": " ".join([seg["text"] for seg in all_segments]),
#                     "segments": all_segments,  # Keep the individual segments
#                     "start_time": all_segments[0]["start_time"],
#                     "end_time": all_segments[-1]["end_time"],
#                 })

#                 # Save overlap segments for the next chunk
#                 overlap_segments = current_chunk[-overlap_size:]
#                 current_chunk = []  # Reset current chunk
#                 current_size = 0

#         # Add the remaining chunk if any
#         if current_chunk:
#             all_segments = overlap_segments + current_chunk
#             chunks.append({
#                 "text": " ".join([seg["text"] for seg in all_segments]),
#                 "segments": all_segments,  # Keep the individual segments
#                 "start_time": all_segments[0]["start_time"],
#                 "end_time": all_segments[-1]["end_time"],
#             })

#         print(f"[CHUNK] Created {len(chunks)} chunks.")
#         logging.info(f"Created {len(chunks)} chunks.")
#         return chunks

#     # def process_chunk(self, chunk):
#     #     print(f"[CHUNK] Processing chunk with text: {chunk['text'][:30]}...")
#     #     logging.info(f"Processing chunk with text: {chunk['text'][:30]}...")
#     #     text = chunk['text']
#     #     embedding = self.embedder.encode(text)
#     #     summary = self.summarizer(text, max_length=100, min_length=25, do_sample=False)[0]['summary_text']
#     #     sentiment = self.sentiment_analyzer(text)[0]
#     #     return {
#     #         "start_time": chunk['start_time'],
#     #         "end_time": chunk['end_time'],
#     #         "text": text,
#     #         "summary": summary,
#     #         "embedding": embedding.tolist(),
#     #         "sentiment": sentiment,
#     #         "processed_at": datetime.utcnow(),
#     #     }
#     def process_chunk(self, chunk):
#         # ----- Chunk-Level Processing -----
#         text = chunk['text']
#         chunk_embedding = self.embedder.encode(text)
#         chunk_summary = self.summarizer(text, max_length=100, min_length=25, do_sample=False)[0]['summary_text']
#         chunk_sentiment = self.sentiment_analyzer(text)[0]
        
#         # ----- Segment-Level Processing -----
#         segment_embeddings = []
#         for seg in chunk.get("segments", []):  # <-- uses the new "segments" key
#             seg_embedding = self.embedder.encode(seg['text'])
#             seg_sentiment = self.sentiment_analyzer(seg['text'])[0]
#             segment_embeddings.append({
#                 "segment_text": seg['text'],
#                 "segment_start_time": seg['start_time'],
#                 "segment_end_time": seg['end_time'],
#                 "segment_embedding": seg_embedding.tolist(),
#                 "segment_sentiment": seg_sentiment
#             })

#         # ----- Return Both Chunk and Segment Data -----
#         return {
#             "start_time": chunk['start_time'],
#             "end_time": chunk['end_time'],

#             # Chunk-level data
#             "chunk_text": text,                  # renamed key from "text" for clarity
#             "chunk_embedding": chunk_embedding.tolist(),
#             "summary": chunk_summary,
#             "sentiment": chunk_sentiment,

#             # Segment-level data
#             "segments": segment_embeddings,      # new list of segment embeddings

#             "processed_at": datetime.utcnow(),
#         }
   
   
#     def process_audio_transcript(self, file_path, file_id):
#         print(f"[START] Processing audio transcript for file: {file_path} with file_id: {file_id}")
#         logging.info(f"Processing audio transcript for file: {file_path} with file_id: {file_id}")
#         print('self.db_client',self.db_client)
#         print("Database collections:", self.db_client.list_collection_names())
#         # Step 0: Verify if file_id exists in the database
#         file_record = self.db_client['files'].find_one({"_id": ObjectId(file_id)})
#         if not file_record:
#             logging.error(f"File with ID {file_id} does not exist in the database.")
#             raise ValueError(f"File with ID {file_id} does not exist in the database.")

#         # Step 1: Parse in Batches
#         for batch_index, batch in enumerate(self.parse_srt_in_batches(file_path, self.batch_size)):
#             print(f"[BATCH] Processing batch {batch_index} with {len(batch)} subtitles.")
#             logging.info(f"Processing batch {batch_index} with {len(batch)} subtitles.")

#             # Step 2: Chunk the transcript
#             chunks = self.chunk_transcript(batch)
#             print(f"[BATCH] Batch {batch_index} created {len(chunks)} chunks.")
#             logging.info(f"Batch {batch_index} created {len(chunks)} chunks.")
#             print(f"[BATCH] Batch {batch_index} created {chunks} chunks.")

#             # Step 3: Process each chunk
#             metadata_list = []
#             for chunk_idx, chunk in enumerate(chunks):
#                 meta = self.process_chunk(chunk)
#                 # Add file_id reference to the metadata
#                 meta["file_id"] = file_id
#                 metadata_list.append(meta)
#                 print(f"[CHUNK] Processed chunk {chunk_idx} in batch {batch_index}.")
#                 logging.info(f"Processed chunk {chunk_idx} in batch {batch_index}.")

#             # Step 4: Save to DB
#             try:
#                 if metadata_list:
#                     self.db_client['chunk_embeddings'].insert_many(metadata_list)
#                     print(f"[DB-SAVE] Successfully saved {len(metadata_list)} items for batch {batch_index}.")
#                     logging.info(f"Successfully saved {len(metadata_list)} items for batch {batch_index}.")
#                 else:
#                     print(f"[DB-SAVE] No data to save for batch {batch_index}.")
#                     logging.info(f"No data to save for batch {batch_index}.")
#             except Exception as e:
#                 print(f"[DB-ERROR] Failed to save items for batch {batch_index}: {e}")
#                 logging.error(f"Failed to save items for batch {batch_index}: {e}")

#             # Flush variables to release memory
#             del chunks
#             del metadata_list
#             self.log_memory_usage(prefix=f"[BATCH-{batch_index}] ")

#         print(f"[END] All batches processed for file: {file_path} with file_id: {file_id}")
#         logging.info(f"All batches processed for file: {file_path} with file_id: {file_id}")

import os
import re
import psutil
import logging
import librosa
import numpy as np
from datetime import datetime
from srt import parse
from sentence_transformers import SentenceTransformer
from transformers import pipeline
# from bson import ObjectId
from bson.objectid import ObjectId

# Zero-shot classification (for topics)
from transformers import pipeline as hf_pipeline

# For Named Entity Recognition (spaCy)
import spacy
nlp = spacy.load("en_core_web_sm")
# For Keyword Extraction (KeyBERT)
from keybert import KeyBERT

# -------------------------------------------------------------------
# Helper function to parse "HH:MM:SS,mmm" or "HH:MM:SS.mmm" to seconds
# -------------------------------------------------------------------
def parse_time_to_seconds(t_str):
    """
    Parses an SRT timestamp string (e.g., "00:01:23,456" or "00:01:23.456")
    and returns the total number of seconds as a float.
    """
    pattern = r'(\d+):(\d+):(\d+)[.,](\d+)'
    match = re.match(pattern, t_str)
    if not match:
        # Fall back if there's no fractional part
        hms_pattern = r'(\d+):(\d+):(\d+)'
        hms_match = re.match(hms_pattern, t_str)
        if hms_match:
            hours, minutes, seconds = hms_match.groups()
            total_seconds = int(hours) * 3600 + int(minutes) * 60 + int(seconds)
            return float(total_seconds)
        else:
            return 0.0
    hours, minutes, seconds, millis = match.groups()
    total_seconds = (int(hours) * 3600) + (int(minutes) * 60) + int(seconds) + float(millis) / 1000.0
    return total_seconds

class AudioProcessor:
    def __init__(self, db_client, file_id, batch_size=20):
        # --- Logging Setup ---
        log_file = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "logs",
            f"audio_processor_{file_id}.log"
        )
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        logging.basicConfig(
            filename=log_file,
            level=logging.DEBUG,
            format="%(asctime)s [%(levelname)s] %(message)s",
        )
        logging.info("Logging setup completed successfully.")
        print(f"Log file path: {log_file}")

        # --- Class Attributes ---
        self.db_client = db_client
        self.file_id = file_id
        self.batch_size = batch_size

        # Embedding model version
        self.embedding_model_version = "all-mpnet-base-v2_2024-01-01"

        # Transformer-based models
        self.embedder = SentenceTransformer('all-mpnet-base-v2')
        self.summarizer = pipeline('summarization', model="facebook/bart-large-cnn")
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.topic_classifier = hf_pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

        # Initialize spaCy for NER
        self.nlp = spacy.load("en_core_web_sm")

        # Initialize KeyBERT for keyword extraction
        self.keybert_model = KeyBERT()

        print(f"[INIT] AudioProcessor initialized with batch_size={batch_size}.")
        logging.info(f"AudioProcessor initialized with batch_size={batch_size}.")

    # --------------------- Speaker Role --------------------- #
    def get_speaker_role(self, segment):
        """
        Example approach: We'll do a naive scan for keywords to guess speaker role.
        Replace with advanced diarization or known speaker metadata if available.
        """
        text_lower = segment["text"].lower()

        if "host:" in text_lower:
            return "Host"
        elif "guest:" in text_lower:
            return "Guest"
        elif "interviewer:" in text_lower:
            return "Interviewer"
        elif "interviewee:" in text_lower:
            return "Interviewee"
        elif "speaker:" in text_lower:
            return "Speaker"
        elif "reporter:" in text_lower:
            return "Reporter"
        elif "anchor:" in text_lower:
            return "Anchor"
        elif "salesperson:" in text_lower:
            return "Salesperson"
        elif "customer:" in text_lower:
            return "Customer"
        return "Unknown"

    # --------------------- Topic Classification --------------------- #
    def classify_topic(self, text):
        """
        Uses a zero-shot classification pipeline with a predefined label list.
        Expand candidate_labels or use a domain-specific approach as needed.
        """
        candidate_labels = [
            "Sports",
            "News",
            "Music",
            "Politics",
            "Education",
            "Business",
            "Technology",
            "Entertainment",
            "Health"
        ]
        if not text.strip():
            return "Unknown"

        result = self.topic_classifier(
            text,
            candidate_labels,
            multi_label=False
        )
        best_label = result["labels"][0]
        return best_label

    # --------------------- Named Entity Recognition --------------------- #
    def extract_entities(self, text):
        """
        Use spaCy to detect named entities in the text.
        Return a list of entities with optional label & offsets.
        """
        doc = self.nlp(text)
        entities = []
        for ent in doc.ents:
            entities.append({
                "text": ent.text,
                "label": ent.label_
                # You can also store start/end offsets: ent.start_char, ent.end_char
            })
        return entities

    # --------------------- Keyword Extraction --------------------- #
    def extract_keywords(self, text, top_n=5):
        """
        Use KeyBERT to extract top_n keywords.
        Returns a list of (keyword, score).
        """
        if not text.strip():
            return []
        keywords = self.keybert_model.extract_keywords(text, top_n=top_n)
        # KeyBERT returns a list of (keyword, score)
        return [{"keyword": kw, "score": float(sc)} for kw, sc in keywords]

    # --------------------- Prosody Analysis --------------------- #
    def analyze_prosody(self, audio_filepath, start_time_str, end_time_str):
        """
        Loads a chunk of audio and computes a basic 'average energy' as an example.
        """
        if not os.path.isfile(audio_filepath):
            return {}

        start_sec = parse_time_to_seconds(start_time_str)
        end_sec = parse_time_to_seconds(end_time_str)
        duration = end_sec - start_sec
        if duration <= 0:
            return {}

        try:
            import librosa
            y, sr = librosa.load(
                audio_filepath,
                offset=start_sec,
                duration=duration,
                sr=None
            )
            # Compute absolute amplitude (energy) and take the mean
            average_energy = float(np.mean(np.abs(y)))
            return {"average_energy": average_energy}
        except Exception as e:
            logging.error(f"[PROSODY] Error loading audio: {e}")
            return {}

    # -------------------------------------------------------- #

    def log_memory_usage(self, prefix=""):
        process = psutil.Process(os.getpid())
        memory = process.memory_info().rss / (1024 * 1024)
        print(f"{prefix}[MEMORY] Usage: {memory:.2f} MB")
        logging.debug(f"{prefix}[MEMORY] Usage: {memory:.2f} MB")

    def parse_srt_in_batches(self, file_path, batch_size):
        """
        Parse the SRT file in batches.
        Each segment includes 'start_time', 'end_time', 'text', 'speaker_role', etc.
        """
        print(f"[PARSE] Parsing SRT file in batches from: {file_path}")
        logging.info(f"Parsing SRT file in batches from: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as file:
            subtitles = list(parse(file.read()))
            for i in range(0, len(subtitles), batch_size):
                batch = subtitles[i:i + batch_size]
                parsed_batch = []
                for sub in batch:
                    segment = {
                        "start_time": str(sub.start),
                        "end_time": str(sub.end),
                        "text": sub.content
                    }
                    # Attempt to determine speaker role
                    speaker_role = self.get_speaker_role(segment)
                    segment["speaker_role"] = speaker_role

                    parsed_batch.append(segment)

                print(f"[PARSE] Yielding batch {i // batch_size + 1} with size {len(parsed_batch)}.")
                logging.info(f"Yielding batch {i // batch_size + 1} with size {len(parsed_batch)}.")
                yield parsed_batch

    def chunk_transcript(self, transcript, chunk_size=100, overlap_size=50):
        """
        Chunks the transcript by approximate word count.
        Overlap helps preserve context across boundaries.
        """
        print(f"[CHUNK] chunk_size={chunk_size}, overlap_size={overlap_size}")
        logging.info(f"chunk_size={chunk_size}, overlap_size={overlap_size}")

        chunks = []
        current_chunk = []
        current_size = 0
        overlap_segments = []

        for segment in transcript:
            if 'text' not in segment or 'start_time' not in segment or 'end_time' not in segment:
                raise ValueError(f"Invalid segment format: {segment}")

            segment_tokens = segment['text'].split()
            current_chunk.append(segment)
            current_size += len(segment_tokens)

            print(f"[CHUNK] Current size: {current_size} / {chunk_size}")
            logging.debug(f"Current size: {current_size} / {chunk_size}")

            if current_size >= chunk_size:
                print(f"[CHUNK] Finalizing chunk at size {current_size}.")
                logging.info(f"Finalizing chunk at size {current_size}.")
                all_segments = overlap_segments + current_chunk

                chunks.append({
                    "text": " ".join([seg["text"] for seg in all_segments]),
                    "segments": all_segments,
                    "start_time": all_segments[0]["start_time"],
                    "end_time": all_segments[-1]["end_time"]
                })

                overlap_segments = current_chunk[-overlap_size:]
                current_chunk = []
                current_size = 0

        if current_chunk:
            all_segments = overlap_segments + current_chunk
            chunks.append({
                "text": " ".join([seg["text"] for seg in all_segments]),
                "segments": all_segments,
                "start_time": all_segments[0]["start_time"],
                "end_time": all_segments[-1]["end_time"]
            })

        print(f"[CHUNK] Created {len(chunks)} chunks.")
        logging.info(f"Created {len(chunks)} chunks.")
        return chunks

    def process_chunk(self, chunk, audio_filepath=None):
        """
        Process a chunk to generate:
          - chunk-level embedding, summary, sentiment, topic, prosody
          - named entities, keywords
          - segment-level embedding, sentiment, topic, prosody, named entities, keywords
        """
        text = chunk['text']
        logging.info(f"[CHUNK] Processing chunk with text: {text[:50]}...")

        # ---- Chunk-Level Analysis ----
        chunk_embedding = self.embedder.encode(text)
        chunk_summary = self.summarizer(text, max_length=100, min_length=25, do_sample=False)[0]['summary_text']
        chunk_sentiment = self.sentiment_analyzer(text)[0]
        chunk_topic = self.classify_topic(text)

        # Named Entities & Keywords at Chunk Level
        chunk_entities = self.extract_entities(text)               # Using spaCy
        chunk_keywords = self.extract_keywords(text, top_n=5)      # Using KeyBERT

        # Optional Prosody
        chunk_prosody = {}
        if audio_filepath:
            chunk_prosody = self.analyze_prosody(audio_filepath, chunk['start_time'], chunk['end_time'])

        # ---- Segment-Level Analysis ----
        segment_metadata_list = []
        for seg in chunk.get("segments", []):
            seg_text = seg["text"]
            seg_embedding = self.embedder.encode(seg_text)
            seg_sentiment = self.sentiment_analyzer(seg_text)[0]
            seg_topic = self.classify_topic(seg_text)
            seg_speaker = seg.get("speaker_role", "Unknown")
            
            # Entities & Keywords
            seg_entities = self.extract_entities(seg_text)
            seg_keywords = self.extract_keywords(seg_text, top_n=3)

            seg_prosody = {}
            if audio_filepath:
                seg_prosody = self.analyze_prosody(audio_filepath, seg['start_time'], seg['end_time'])

            segment_metadata_list.append({
                "segment_text": seg_text,
                "segment_start_time": seg['start_time'],
                "segment_end_time": seg['end_time'],
                "segment_embedding": seg_embedding.tolist(),
                "segment_sentiment": seg_sentiment,
                "segment_topic": seg_topic,
                "speaker_role": seg_speaker,
                "segment_entities": seg_entities,
                "segment_keywords": seg_keywords,
                "segment_prosody": seg_prosody
            })

        # Return final chunk document
        return {
            "start_time": chunk['start_time'],
            "end_time": chunk['end_time'],
            "chunk_text": text,
            "chunk_embedding": chunk_embedding.tolist(),
            "summary": chunk_summary,
            "sentiment": chunk_sentiment,
            "topic": chunk_topic,
            "chunk_entities": chunk_entities,
            "chunk_keywords": chunk_keywords,
            "prosody": chunk_prosody,

            "segments": segment_metadata_list,
            "embedding_model_version": self.embedding_model_version,
            "processed_at": datetime.utcnow(),
        }

    def process_audio_transcript(self, file_path, file_id, audio_filepath=None):
        """
        Main entry point to parse the SRT, chunk the transcript, process each chunk,
        and store results in the 'chunk_embeddings' collection.

        Args:
            file_path: Path to the .srt file
            file_id: Reference to the 'files' document in Mongo
            audio_filepath: (Optional) path to the raw audio file if you need prosody analysis
        """
        print(f"[START] Processing audio transcript for file: {file_path} with file_id: {file_id}")
        logging.info(f"Processing audio transcript for file: {file_path} with file_id: {file_id}")

        # Validate existence of file record (assuming you track files in your DB)
        file_record = self.db_client['files'].find_one({"_id": ObjectId(file_id)})
        if not file_record:
            logging.error(f"File with ID {file_id} does not exist in the database.")
            raise ValueError(f"File with ID {file_id} does not exist in the database.")

        # Step 1: Parse SRT in Batches
        for batch_index, batch in enumerate(self.parse_srt_in_batches(file_path, self.batch_size)):
            print(f"[BATCH] Processing batch {batch_index} with {len(batch)} subtitles.")
            logging.info(f"Processing batch {batch_index} with {len(batch)} subtitles.")

            # Step 2: Chunk the Transcript
            chunks = self.chunk_transcript(batch)
            print(f"[BATCH] Batch {batch_index} created {len(chunks)} chunks.")
            logging.info(f"Batch {batch_index} created {len(chunks)} chunks.")

            # Step 3: Process Each Chunk
            metadata_list = []
            for chunk_idx, chunk in enumerate(chunks):
                meta = self.process_chunk(chunk, audio_filepath=audio_filepath)
                meta["file_id"] = file_id
                metadata_list.append(meta)
                print(f"[CHUNK] Processed chunk {chunk_idx} in batch {batch_index}.")
                logging.info(f"Processed chunk {chunk_idx} in batch {batch_index}.")

            # for meta in metadata_list:
            #     # Make a copy of the metadata entry so we don't remove fields from the original
            #     meta_copy = dict(meta)

            #     # Remove the chunk embedding
            #     if "chunk_embedding" in meta_copy:
            #         del meta_copy["chunk_embedding"]

            #     # Remove the segment embeddings
            #     for seg in meta_copy.get("segments", []):
            #         if "segment_embedding" in seg:
            #             del seg["segment_embedding"]

            #     print(meta_copy)

            # Step 4: Save to DB
            try:
                if metadata_list:
                    self.db_client['chunk_embeddings'].insert_many(metadata_list)
                    print(f"[DB-SAVE] Successfully saved {len(metadata_list)} items for batch {batch_index}.")
                    logging.info(f"Successfully saved {len(metadata_list)} items for batch {batch_index}.")
                else:
                    print(f"[DB-SAVE] No data to save for batch {batch_index}.")
                    logging.info(f"No data to save for batch {batch_index}.")
            except Exception as e:
                print(f"[DB-ERROR] Failed to save items for batch {batch_index}: {e}")
                logging.error(f"Failed to save items for batch {batch_index}: {e}")

            # Clean up
            del chunks
            del metadata_list
            self.log_memory_usage(prefix=f"[BATCH-{batch_index}] ")

        print(f"[END] All batches processed for file: {file_path} with file_id: {file_id}")
        logging.info(f"All batches processed for file: {file_path} with file_id: {file_id}")