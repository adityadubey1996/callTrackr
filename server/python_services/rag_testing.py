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

    def process_query(self, chunks):
        """Process the query using embeddings and LLM for RAG."""
        try:
            # Generate query embedding
            query_embedding = self.embedder.encode(self.query)
            logging.info(f"Generated embedding for query: {self.query}")

            # Compute similarity scores
            chunk_texts = [chunk["text"] for chunk in chunks]
            chunk_embeddings = [chunk["embedding"] for chunk in chunks]
            scores = util.cos_sim(query_embedding, chunk_embeddings)[0].tolist()

            # Retrieve top relevant chunks
            top_k = 3
            relevant_chunks = sorted(
                zip(scores, chunk_texts),
                key=lambda x: x[0],
                reverse=True
            )[:top_k]

            # Prepare context for LLM
            context = "\n".join([text for _, text in relevant_chunks])
            logging.info(f"Top {top_k} relevant chunks selected for query.")

            # Generate response using Groq API
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Given the following context:\n{context}\nAnswer the query: {self.query}"}
            ]
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model="llama3-8b-8192",
            )
            response = chat_completion.choices[0].message.content
            logging.info(f"Generated response for query: {self.query}")
            return response
        except Exception as e:
            logging.error(f"Error processing query: {e}")
            return "Error in generating response."

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