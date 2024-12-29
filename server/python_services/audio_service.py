

import os
import psutil
import logging
from datetime import datetime
from srt import parse
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from bson import ObjectId



class AudioProcessor:
    def __init__(self, db_client,file_id,  batch_size=20):
        # Define the log file path relative to the current file
        log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs", f"audio_processor_{file_id}.log")

        # Ensure the logs directory exists
        os.makedirs(os.path.dirname(log_file), exist_ok=True)

        # Configure logging
        logging.basicConfig(
            filename=log_file,
            level=logging.DEBUG,
            format="%(asctime)s [%(levelname)s] %(message)s",
        )

        # Test log message
        logging.info("Logging setup completed successfully.")
        print(f"Log file path: {log_file}")

        self.db_client = db_client
        self.embedder = SentenceTransformer('all-mpnet-base-v2')
        self.summarizer = pipeline('summarization', model="facebook/bart-large-cnn")
        self.sentiment_analyzer = pipeline("sentiment-analysis")  
        self.batch_size = batch_size
        print(f"[INIT] AudioProcessor initialized with batch_size={batch_size}.")
        logging.info(f"AudioProcessor initialized with batch_size={batch_size}.")

    def log_memory_usage(self, prefix=""):
        process = psutil.Process(os.getpid())
        memory = process.memory_info().rss / (1024 * 1024)
        print(f"{prefix}[MEMORY] Usage: {memory:.2f} MB")
        logging.debug(f"{prefix}[MEMORY] Usage: {memory:.2f} MB")

    def parse_srt_in_batches(self, file_path, batch_size):
        print(f"[PARSE] Parsing SRT file in batches from: {file_path}")
        logging.info(f"Parsing SRT file in batches from: {file_path}")
        with open(file_path, 'r') as file:
            subtitles = list(parse(file.read()))
            for i in range(0, len(subtitles), batch_size):
                batch = subtitles[i:i + batch_size]
                parsed_batch = [
                    {"start_time": str(sub.start), "end_time": str(sub.end), "text": sub.content}
                    for sub in batch
                ]
                print(f"[PARSE] Yielding batch {i // batch_size + 1} with size {len(parsed_batch)}.")
                logging.info(f"Yielding batch {i // batch_size + 1} with size {len(parsed_batch)}.")
                yield parsed_batch

    def chunk_transcript(self, transcript, chunk_size=100, overlap_size=50):
        print(f"[CHUNK] chunk_size={chunk_size}, overlap_size={overlap_size}")
        logging.info(f"chunk_size={chunk_size}, overlap_size={overlap_size}")
        chunks = []
        current_chunk = []
        current_size = 0
        overlap_segments = []  # Store segments for the next chunk's overlap

        for segment in transcript:
            # Validate segment format
            if 'text' not in segment or 'start_time' not in segment or 'end_time' not in segment:
                raise ValueError(f"Invalid segment format: {segment}")

            segment_tokens = segment['text'].split(" ")
            current_chunk.append(segment)
            current_size += len(segment_tokens)

            print(f"[CHUNK] Current size: {current_size} / {chunk_size}")
            logging.debug(f"Current size: {current_size} / {chunk_size}")

            # If current chunk exceeds the size, create a new chunk
            if current_size >= chunk_size:
                print(f"[CHUNK] Finalizing chunk at size {current_size}.")
                logging.info(f"Finalizing chunk at size {current_size}.")
                chunks.append({
                    "text": " ".join([seg["text"] for seg in overlap_segments + current_chunk]),
                    "start_time": (overlap_segments + current_chunk)[0]["start_time"],
                    "end_time": current_chunk[-1]["end_time"],
                })

                # Save overlap segments for the next chunk
                overlap_segments = current_chunk[-overlap_size:]
                current_chunk = []  # Reset current chunk
                current_size = 0

        # Add the remaining chunk if any
        if current_chunk:
            chunks.append({
                "text": " ".join([seg["text"] for seg in overlap_segments + current_chunk]),
                "start_time": (overlap_segments + current_chunk)[0]["start_time"],
                "end_time": current_chunk[-1]["end_time"],
            })
        print(f"[CHUNK] Created {len(chunks)} chunks.")
        logging.info(f"Created {len(chunks)} chunks.")
        return chunks

    def process_chunk(self, chunk):
        print(f"[CHUNK] Processing chunk with text: {chunk['text'][:30]}...")
        logging.info(f"Processing chunk with text: {chunk['text'][:30]}...")
        text = chunk['text']
        embedding = self.embedder.encode(text)
        summary = self.summarizer(text, max_length=100, min_length=25, do_sample=False)[0]['summary_text']
        sentiment = self.sentiment_analyzer(text)[0]
        return {
            "start_time": chunk['start_time'],
            "end_time": chunk['end_time'],
            "text": text,
            "summary": summary,
            "embedding": embedding.tolist(),
            "sentiment": sentiment,
            "processed_at": datetime.utcnow(),
        }

    def process_audio_transcript(self, file_path, file_id):
        print(f"[START] Processing audio transcript for file: {file_path} with file_id: {file_id}")
        logging.info(f"Processing audio transcript for file: {file_path} with file_id: {file_id}")
        print('self.db_client',self.db_client)
        print("Database collections:", self.db_client.list_collection_names())
        # Step 0: Verify if file_id exists in the database
        file_record = self.db_client['files'].find_one({"_id": ObjectId(file_id)})
        if not file_record:
            logging.error(f"File with ID {file_id} does not exist in the database.")
            raise ValueError(f"File with ID {file_id} does not exist in the database.")

        # Step 1: Parse in Batches
        for batch_index, batch in enumerate(self.parse_srt_in_batches(file_path, self.batch_size)):
            print(f"[BATCH] Processing batch {batch_index} with {len(batch)} subtitles.")
            logging.info(f"Processing batch {batch_index} with {len(batch)} subtitles.")

            # Step 2: Chunk the transcript
            chunks = self.chunk_transcript(batch)
            print(f"[BATCH] Batch {batch_index} created {len(chunks)} chunks.")
            logging.info(f"Batch {batch_index} created {len(chunks)} chunks.")

            # Step 3: Process each chunk
            metadata_list = []
            for chunk_idx, chunk in enumerate(chunks):
                meta = self.process_chunk(chunk)
                # Add file_id reference to the metadata
                meta["file_id"] = file_id
                metadata_list.append(meta)
                print(f"[CHUNK] Processed chunk {chunk_idx} in batch {batch_index}.")
                logging.info(f"Processed chunk {chunk_idx} in batch {batch_index}.")

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

            # Flush variables to release memory
            del chunks
            del metadata_list
            self.log_memory_usage(prefix=f"[BATCH-{batch_index}] ")

        print(f"[END] All batches processed for file: {file_path} with file_id: {file_id}")
        logging.info(f"All batches processed for file: {file_path} with file_id: {file_id}")