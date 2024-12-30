import os
import logging
from bson import ObjectId
from sentence_transformers import SentenceTransformer, util
from pymongo import MongoClient
from groq import Groq
from dotenv import load_dotenv

class RAGProcessor:
    def __init__(self, db, conversation_id, query):
        self.db = db
        self.conversation_id = conversation_id
        self.query = query

        # Load environment variables
        load_dotenv()
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        # Initialize embedding model
        self.embedder = SentenceTransformer("all-mpnet-base-v2")

        # Set up logging
        log_file = os.path.join(
            os.getcwd(), 
            "logs", 
            f"user_query_logs_for_chat_{self.conversation_id}.log"
        )
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        logging.basicConfig(
            filename=log_file,
            level=logging.DEBUG,
            format="%(asctime)s [%(levelname)s] %(message)s",
        )
        logging.info(f"Initialized RAGProcessor for conversation_id={conversation_id}")

    def fetch_chunks(self):
        """Fetch chunks from the database using the conversation_id."""
        try:
            conversation_collection = self.db['conversations']
            conversation_from_database = conversation_collection.find_one({"_id": ObjectId(self.conversation_id)})
            if not conversation_from_database:
                raise ValueError(f"No conversation found for conversation_id: {self.conversation_id}")

            file_id = conversation_from_database['fileIds'][0]
            print('file_id for conversation', file_id)
            if not file_id:
                 raise ValueError(f"No file_id found for conversation_id: {self.conversation_id}")
               
            collection = self.db["chunk_embeddings"]
            chunks = list(collection.find({"file_id": f"{file_id}"}))
           

            if not chunks:
                raise ValueError(f"No chunks found for file_id: {file_id}")

            logging.info(f"Fetched {len(chunks)} chunks for file_id: {file_id}")
            return chunks
        except Exception as e:
            logging.error(f"Error fetching chunks: {e}")
            raise

    # def process_query(self, chunks):
    #     """Process the query using embeddings and LLM for RAG."""
    #     try:
    #         # Generate query embedding
    #         query_embedding = self.embedder.encode(self.query)
    #         logging.info(f"Generated embedding for query: {self.query}")

    #         # Compute similarity scores
    #         chunk_texts = [chunk["text"] for chunk in chunks]
    #         chunk_embeddings = [chunk["embedding"] for chunk in chunks]
    #         scores = util.cos_sim(query_embedding, chunk_embeddings)[0].tolist()

    #         # Retrieve top relevant chunks
    #         top_k = 3
    #         relevant_chunks = sorted(
    #             zip(scores, chunk_texts),
    #             key=lambda x: x[0],
    #             reverse=True
    #         )[:top_k]

    #         # Prepare context for LLM
    #         context = "\n".join([text for _, text in relevant_chunks])
    #         logging.info(f"Top {top_k} relevant chunks selected for query.")

    #         # Generate response using Groq API
    #         messages = [
    #             {"role": "system", "content": "You are a helpful assistant."},
    #             {"role": "user", "content": f"Given the following context:\n{context}\nAnswer the query: {self.query}"}
    #         ]
    #         chat_completion = self.client.chat.completions.create(
    #             messages=messages,
    #             model="llama3-8b-8192",
    #         )
    #         response = chat_completion.choices[0].message.content
    #         logging.info(f"Generated response for query: {self.query}")
    #         return response
    #     except Exception as e:
    #         logging.error(f"Error processing query: {e}")
    #         return "Error in generating response."


    def process_query(self, chunks):
        """
        Updated method to:
        1. Retrieve top chunk-level matches.
        2. For each top chunk, retrieve top segment-level matches.
        3. Merge chunk- and segment-level matches to build final context and references.
        4. Return LLM answer + references with similarity scores.
        """

        # ----- 1) Get Query Embedding -----
        query_embedding = self.embedder.encode(self.query)

        # ----- 2) Chunk-Level Retrieval -----
        # We'll retrieve top N chunks by comparing query_embedding to chunk_embedding
        chunk_embeddings = [chunk["chunk_embedding"] for chunk in chunks]
        chunk_scores = util.cos_sim(query_embedding, chunk_embeddings)[0].tolist()  
        # Store chunk-level references with needed metadata
        chunk_refs = []
        for chunk, score in zip(chunks, chunk_scores):
            chunk_refs.append({
                "chunk": chunk,          # The entire chunk doc
                "similarity_score": score
            })

        # Sort descending by similarity
        chunk_refs.sort(key=lambda x: x["similarity_score"], reverse=True)

        # Choose how many top chunks to further analyze
        top_chunks_to_expand = 5  # You can adjust this number
        top_chunk_refs = chunk_refs[:top_chunks_to_expand]

        # ----- 3) Segment-Level Retrieval -----
        # For each chunk in the top N chunks, compare query embedding to each segment_embedding
        segment_matches = []
        for c_ref in top_chunk_refs:
            chunk_doc = c_ref["chunk"]
            for seg in chunk_doc.get("segments", []):
                seg_score = util.cos_sim(query_embedding, [seg["segment_embedding"]])[0][0].item()
                segment_matches.append({
                    "chunk_doc": chunk_doc,
                    "segment_text": seg["segment_text"],
                    "segment_start_time": seg["segment_start_time"],
                    "segment_end_time": seg["segment_end_time"],
                    "similarity_score": seg_score
                })

        # Sort segment_matches descending by similarity
        segment_matches.sort(key=lambda x: x["similarity_score"], reverse=True)

        # Decide how many top segments to include (for pinpoint accuracy)
        top_segments_limit = 5
        top_segment_refs = segment_matches[:top_segments_limit]

        # ----- 4) Merge Chunk-Level & Segment-Level for Final Context Build -----

        # (A) Pick top chunk-level matches
        #     This could be used for broad "context" or "summary"
        top_chunks_for_context = 3  # how many chunk-level context pieces
        best_chunk_context = []
        for ref in chunk_refs[:top_chunks_for_context]:
            cd = ref["chunk"]
            best_chunk_context.append(cd["chunk_text"])

        # (B) Also gather top segment-level text for pinpoint references
        best_segment_context = []
        for seg_ref in top_segment_refs:
            best_segment_context.append(seg_ref["segment_text"])

        # Create final context by combining chunk-level + segment-level text
        # (Adjust strategy as you see fit)
        context = "\n--- Chunk-Level Context ---\n"
        context += "\n".join(best_chunk_context)
        context += "\n\n--- Segment-Level Context ---\n"
        context += "\n".join(best_segment_context)

        # ----- 5) Generate Answer using LLM (Groq) -----
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {
                "role": "user", 
                "content": f"Given the following context:\n{context}\n"
                        f"Answer the query: {self.query}"
            }
        ]
        chat_completion = self.client.chat.completions.create(
            messages=messages,
            model="llama3-8b-8192",
        )
        response = chat_completion.choices[0].message.content

        # ----- 6) Build Output with References (Similarities + Timestamps) -----
        # Return both the final response AND the references (chunks & segments) with scores

        # Example: top 3 chunk references + top 3 segment references
        references = {
            "chunk_references": [
                {
                    "chunk_text": ref["chunk"]["chunk_text"],
                    "start_time": ref["chunk"]["start_time"],
                    "end_time": ref["chunk"]["end_time"],
                    "similarity_score": ref["similarity_score"]
                }
                for ref in chunk_refs[:3]
            ],
            "segment_references": [
                {
                    "segment_text": seg_ref["segment_text"],
                    "start_time": seg_ref["segment_start_time"],
                    "end_time": seg_ref["segment_end_time"],
                    "similarity_score": seg_ref["similarity_score"]
                }
                for seg_ref in top_segment_refs[:3]
            ]
        }

        return {
            "answer": response,
            "references": references
        }


    def process(self):
        """Main process for fetching chunks and processing query."""
        try:
            chunks = self.fetch_chunks()
            response = self.process_query(chunks)
            print(f"Response:\n{response}")
            return response
        except Exception as e:
            logging.error(f"Error during processing: {e}")
            print("An error occurred. Check logs for details.",e )

# Example Usage
if __name__ == "__main__":
    from utils_python.connect_db import connectDB

    # Replace these with actual arguments or inputs
    CONVERSATION_ID = "replace_with_conversation_id"
    QUERY = "What kind of audio file is this?"

    # Connect to database
    db = connectDB()["test"]

    # Initialize and run RAGProcessor
    rag_processor = RAGProcessor(db, CONVERSATION_ID, QUERY)
    rag_processor.process()