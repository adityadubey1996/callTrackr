


# import argparse
# import json
# import logging
# import os
# import re
# from utils_python.connect_db import connectDB
# from groq import Groq

# # Configure logging
# logging.basicConfig(
#     filename="metric_processor.log",
#     level=logging.DEBUG,
#     format="%(asctime)s [%(levelname)s] %(message)s",
# )

# class MetricProcessor:
#     def __init__(self, db):
#         self.db = db
#         self.chunk_collection = self.db["chunk_embeddings"]
#         self.api_key = os.getenv("GROQ_API_KEY")
#         self.llm_client = Groq(api_key=self.api_key)
#         self.batch_size = 20
#         logging.info("MetricProcessor initialized.")
#         print("MetricProcessor initialized.")

#     def fetch_relevant_chunks(self, file_ids, metric_name, limit=100):
#         logging.info(f"Fetching relevant chunks for file_ids={file_ids} with metric_name='{metric_name}'.")
#         # print(f"Fetching relevant chunks for file_ids={file_ids} with metric_name='{metric_name}'.")

#         try:
#             file_id_query = {"$in": file_ids} if isinstance(file_ids, list) else file_ids
#             keywords = re.findall(r"\w+", metric_name.lower())
#             keyword_patterns = "|".join(re.escape(keyword) for keyword in keywords)

#             query = {
#                 "file_id": file_id_query,
#                 "$or": [
#                     {"chunk_text": {"$regex": keyword_patterns, "$options": "i"}},
#                     {"segments.segment_text": {"$regex": keyword_patterns, "$options": "i"}}
#                 ]
#             }

#             # print(f"Constructed query: {query}")
#             chunks = list(
#                 self.chunk_collection.find(query)
#                 .sort([("relevance_score", -1)])
#                 .limit(limit)
#             )

#             logging.info(f"Fetched {len(chunks)} chunks for file_ids={file_ids}.")
#             # print(f"Fetched {len(chunks)} chunks for file_ids={file_ids}.")
#             return chunks
#         except Exception as e:
#             logging.error(f"Error fetching chunks: {str(e)}")
#             print(f"Error fetching chunks: {str(e)}")
#             return []

#     def batch_chunks(self, chunks):
#         logging.info(f"Batching {len(chunks)} chunks with batch size {self.batch_size}.")
#         # print(f"Batching {len(chunks)} chunks with batch size {self.batch_size}.")
#         for i in range(0, len(chunks), self.batch_size):
#             yield chunks[i:i + self.batch_size]

#     def generate_llm_prompt_with_context(self, chunks, metric_name, metric_type):
#         logging.debug(f"Generating LLM prompt for metric_name='{metric_name}', metric_type='{metric_type}'.")
#         # print(f"Generating LLM prompt for metric_name='{metric_name}', metric_type='{metric_type}'.")

#         if not chunks:
#             logging.warning("No chunks available for prompt generation.")
#             print("No chunks available for prompt generation.")
#             return None

#         chunk_context = "\n".join(
#             [
#                 f"{i+1}. \"{chunk['chunk_text']}\" (Timestamp: {chunk['start_time']} - {chunk['end_time']})"
#                 for i, chunk in enumerate(chunks)
#             ]
#         )

#         if metric_type == "Yes/No":
#             prompt = f"""
#             Based on the following chunks:
#             {chunk_context}
#             Answer the question: "Was the topic '{metric_name}' discussed? Respond with 'Yes' or 'No'."
#             """
#         elif metric_type == "Numeric":
#             prompt = f"""
#             Based on the following chunks:
#             {chunk_context}
#             Count how many times the keyword '{metric_name}' was mentioned.
#             """
#         elif metric_type == "Text":
#             prompt = f"""
#             Based on the following chunks:
#             {chunk_context}
#             Provide a summary about '{metric_name}'.
#             """
#         else:
#             logging.error(f"Unsupported metric type: {metric_type}")
#             # print(f"Unsupported metric type: {metric_type}")
#             raise ValueError("Unsupported metric type.")

#         logging.debug(f"Generated prompt: {prompt.strip()}")
#         # print(f"Generated prompt: {prompt.strip()}")
#         return prompt

#     def parse_llm_response(self, response, metric_type):
#         """
#         Parse the LLM response to extract relevant results.
#         """
#         print(f"Parsing LLM response: {response}")
#         if metric_type == "Numeric":
#             match = re.search(r"\b(\d+)\b", response)
#             return int(match.group(1)) if match else 0
#         elif metric_type == "Yes/No":
#             return "Yes" if "yes" in response.lower() else "No"
#         elif metric_type == "Text":
#             return response.strip()
#         else:
#             raise ValueError("Unsupported metric type for parsing.")

#     # def process_metric(self, file_ids, metric):
#     #     logging.info(f"Processing metric '{metric}' for file_ids='{file_ids}'.")
#     #     # print(f"Processing metric '{metric}' for file_ids='{file_ids}'.")

#     #     chunks = self.fetch_relevant_chunks(file_ids, metric["name"])

#     #     if not chunks:
#     #         error_msg = f"No relevant chunks found for the given metric: {metric['name']}"
#     #         logging.warning(error_msg)
#     #         print(error_msg)
#     #         return {"error": error_msg}

#     #     results = []
#     #     for batch in self.batch_chunks(chunks):
#     #         prompt = self.generate_llm_prompt_with_context(batch, metric["name"], metric["type"])
#     #         if not prompt:
#     #             continue

#     #         try:
#     #             logging.info(f"Calling LLM for batch of size {len(batch)}.")
#     #             # print(f"Calling LLM for batch of size {len(batch)}.")
#     #             response = self.llm_client.chat.completions.create(
#     #                 model="llama3-8b-8192",
#     #                 messages=[{"role": "user", "content": prompt}]
#     #             )
#     #             llm_response = response.choices[0].message.content.strip()
#     #             result = self.parse_llm_response(llm_response, metric["type"])
#     #             results.append(result)
#     #             logging.info(f"Received LLM response: {llm_response}")
#     #             # print(f"Received LLM response: {llm_response}")
#     #         except Exception as e:
#     #             error_msg = f"LLM processing failed: {str(e)}"
#     #             logging.error(error_msg)
#     #             print(error_msg)
#     #             return {"error": error_msg}

#     #     final_result = self.aggregate_results(results, metric["type"])
#     #     logging.info(f"Final result for metric '{metric['name']}': {final_result}")
#     #     # print(f"Final result for metric '{metric['name']}': {final_result}")

#     #     return {
#     #         "metric": metric["name"],
#     #         "result": final_result,
#     #         "llm_response": llm_response,
#     #         "context": [
#     #             {
#     #                 "text": chunk["chunk_text"],
#     #                 "file_id": chunk["file_id"],
#     #                 "start_time": chunk["start_time"],
#     #                 "end_time": chunk["end_time"],
#     #                 "sentiment": chunk.get("sentiment"),
#     #                 "keywords": chunk.get("chunk_keywords"),
#     #             }
#     #             for chunk in chunks
#     #         ],
#     #     }


#     def process_metric(self, file_ids, metric):
#         logging.info(f"Processing metric '{metric}' for file_ids='{file_ids}'.")
        
#         # Group results by file_id
#         file_results = {}

#         for file_id in file_ids:
#             chunks = self.fetch_relevant_chunks([file_id], metric["name"])

#             if not chunks:
#                 error_msg = f"No relevant chunks found for the given metric: {metric['name']} in file_id: {file_id}"
#                 logging.warning(error_msg)
#                 file_results[file_id] = {"error": error_msg,  "metric": metric['name'],
       
#         "metricId": metric["id"],}
#                 continue

#             results = []
#             for batch in self.batch_chunks(chunks):
#                 prompt = self.generate_llm_prompt_with_context(batch, metric["name"], metric["type"])
#                 if not prompt:
#                     continue

#                 try:
#                     logging.info(f"Calling LLM for batch of size {len(batch)}.")
#                     response = self.llm_client.chat.completions.create(
#                         model="llama3-8b-8192",
#                         messages=[{"role": "user", "content": prompt}]
#                     )
#                     llm_response = response.choices[0].message.content.strip()
#                     result = self.parse_llm_response(llm_response, metric["type"])
#                     results.append(result)
#                     logging.info(f"Received LLM response: {llm_response}")
#                 except Exception as e:
#                     error_msg = f"LLM processing failed: {str(e)}"
#                     logging.error(error_msg)
#                     file_results[file_id] = {"error": error_msg,  "metric": metric['name'],
       
#         "metricId": metric["id"],}
                 
#                     break

#             if file_id in file_results and "error" in file_results[file_id]:
#                 continue

#             final_result = self.aggregate_results(results, metric["type"])
#             file_results[file_id] = {
#                 "metric": metric["name"],
#                 "result": final_result,
#                 "metricId": metric["id"],
#                 "llm_response": llm_response,
#                 "context": [
#                     {
#                         "text": chunk["chunk_text"],
#                         "file_id": chunk["file_id"],
#                         "start_time": chunk["start_time"],
#                         "end_time": chunk["end_time"],
#                         "sentiment": chunk.get("sentiment"),
#                         "keywords": chunk.get("chunk_keywords"),
#                     }
#                     for chunk in chunks
#                 ],
#             }

#         return file_results
#     def aggregate_results(self, results, metric_type):
#         logging.debug(f"Aggregating results for metric_type='{metric_type}' with results={results}.")
#         print(f"Aggregating results for metric_type='{metric_type}' with results={results}.")

#         if metric_type.lower() == "yes/no":
#             yes_count = sum(1 for r in results if r.lower() == "yes")
#             no_count = sum(1 for r in results if r.lower() == "no")
#             return "Yes" if yes_count >= no_count else "No"
#         elif metric_type.lower() == "numeric":
#             return sum(results)
#         elif metric_type.lower() == "text":
#             return " ".join(results)
#         else:
#             raise ValueError("Unsupported metric type.")

# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="Process a metric for a file.")
#     parser.add_argument("--fileId", required=True, help="File IDs to process the metric (comma-separated).")
#     parser.add_argument("--process_metric", required=True, help="Metric to process (JSON string).")
#     args = parser.parse_args()

#     file_ids = args.fileId.split(",")
#     metric = json.loads(args.process_metric)

#     db = connectDB()["test"]
#     processor = MetricProcessor(db)

#     try:
#         result = processor.process_metric(file_ids, metric)
#         print(json.dumps(result, indent=4))
#         logging.info(f"Processed metric successfully: {result}")
#     except Exception as e:
#         error_msg = {"error": str(e)}
#         print(json.dumps(error_msg, indent=4))
#         logging.error(f"Error processing metric: {str(e)}")


import argparse
import json
import logging
import os
import re
from utils_python.connect_db import connectDB
from groq import Groq

# Configure logging
logging.basicConfig(
    filename="metric_processor.log",
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

class MetricProcessor:
    def __init__(self, db):
        self.db = db
        self.chunk_collection = self.db["chunk_embeddings"]
        self.api_key = os.getenv("GROQ_API_KEY")
        self.llm_client = Groq(api_key=self.api_key)
        self.batch_size = 20
        logging.info("MetricProcessor initialized.")
        print("[DEBUG] MetricProcessor initialized.")

    def fetch_relevant_chunks(self, file_ids, metric_name, limit=100):
        print(f"[DEBUG] Fetching relevant chunks for file_ids={file_ids} with metric_name='{metric_name}'")
        logging.info(f"Fetching relevant chunks for file_ids={file_ids} with metric_name='{metric_name}'.")

        try:
            file_id_query = {"$in": file_ids} if isinstance(file_ids, list) else file_ids
            keywords = re.findall(r"\w+", metric_name.lower())
            keyword_patterns = "|".join(re.escape(keyword) for keyword in keywords)

            query = {
                "file_id": file_id_query,
                "$or": [
                    {"chunk_text": {"$regex": keyword_patterns, "$options": "i"}},
                    {"segments.segment_text": {"$regex": keyword_patterns, "$options": "i"}}
                ]
            }

            print(f"[DEBUG] Constructed query: {query}")
            chunks = list(
                self.chunk_collection.find(query)
                .sort([("relevance_score", -1)])
                .limit(limit)
            )

            print(f"[DEBUG] Fetched {len(chunks)} chunks.")
            logging.info(f"Fetched {len(chunks)} chunks for file_ids={file_ids}.")
            return chunks
        except Exception as e:
            logging.error(f"Error fetching chunks: {str(e)}")
            print(f"[ERROR] Error fetching chunks: {str(e)}")
            return []

    def batch_chunks(self, chunks):
        print(f"[DEBUG] Batching {len(chunks)} chunks with batch size {self.batch_size}.")
        logging.info(f"Batching {len(chunks)} chunks with batch size {self.batch_size}.")
        for i in range(0, len(chunks), self.batch_size):
            yield chunks[i:i + self.batch_size]

    def generate_llm_prompt_with_context(self, chunks, metric_name, metric_type):
        print(f"[DEBUG] Generating LLM prompt for metric_name='{metric_name}', metric_type='{metric_type}'")
        logging.debug(f"Generating LLM prompt for metric_name='{metric_name}', metric_type='{metric_type}'.")

        if not chunks:
            logging.warning("No chunks available for prompt generation.")
            print("[WARNING] No chunks available for prompt generation.")
            return None

        chunk_context = "\n".join(
            [
                f"{i+1}. \"{chunk['chunk_text']}\" (Timestamp: {chunk['start_time']} - {chunk['end_time']})"
                for i, chunk in enumerate(chunks)
            ]
        )

        if metric_type == "Yes/No":
            prompt = f"""
            Based on the following chunks:
            {chunk_context}
            Answer the question: "Was the topic '{metric_name}' discussed? Respond with 'Yes' or 'No'."
            """
        elif metric_type == "Numeric":
            prompt = f"""
            Based on the following chunks:
            {chunk_context}
            Count how many times the keyword '{metric_name}' was mentioned.
            """
        elif metric_type == "Text":
            prompt = f"""
            Based on the following chunks:
            {chunk_context}
            Provide a summary about '{metric_name}'.
            """
        else:
            logging.error(f"Unsupported metric type: {metric_type}")
            print(f"[ERROR] Unsupported metric type: {metric_type}")
            raise ValueError("Unsupported metric type.")

        print(f"[DEBUG] Generated prompt: {prompt.strip()}")
        logging.debug(f"Generated prompt: {prompt.strip()}")
        return prompt

    def parse_llm_response(self, response, metric_type):
        print(f"[DEBUG] Parsing LLM response: {response}")
        if metric_type == "Numeric":
            match = re.search(r"\b(\d+)\b", response)
            return int(match.group(1)) if match else 0
        elif metric_type == "Yes/No":
            return "Yes" if "yes" in response.lower() else "No"
        elif metric_type == "Text":
            return response.strip()
        else:
            raise ValueError("Unsupported metric type for parsing.")

    def process_metric(self, file_ids, metric):
        print(f"[DEBUG] Processing metric '{metric}' for file_ids='{file_ids}'.")
        logging.info(f"Processing metric '{metric}' for file_ids='{file_ids}'.")

        # Group results by file_id
        file_results = {}

        for file_id in file_ids:
            print(f"[DEBUG] Processing file_id: {file_id}")
            chunks = self.fetch_relevant_chunks([file_id], metric["name"])

            if not chunks:
                error_msg = f"No relevant chunks found for the given metric: {metric['name']} in file_id: {file_id}"
                print(f"[WARNING] {error_msg}")
                logging.warning(error_msg)
                file_results[file_id] = {"error": error_msg, "metric": metric['name'], "metricId": metric["id"]}
                continue

            results = []
            for batch in self.batch_chunks(chunks):
                prompt = self.generate_llm_prompt_with_context(batch, metric["name"], metric["type"])
                if not prompt:
                    continue

                try:
                    print(f"[DEBUG] Calling LLM for batch of size {len(batch)}.")
                    logging.info(f"Calling LLM for batch of size {len(batch)}.")
                    response = self.llm_client.chat.completions.create(
                        model="llama3-8b-8192",
                        messages=[{"role": "user", "content": prompt}]
                    )
                    llm_response = response.choices[0].message.content.strip()
                    result = self.parse_llm_response(llm_response, metric["type"])
                    results.append(result)
                    print(f"[DEBUG] Received LLM response: {llm_response}")
                    logging.info(f"Received LLM response: {llm_response}")
                except Exception as e:
                    error_msg = f"LLM processing failed: {str(e)}"
                    print(f"[ERROR] {error_msg}")
                    logging.error(error_msg)
                    file_results[file_id] = {"error": error_msg, "metric": metric['name'], "metricId": metric["id"]}
                    break

            if file_id in file_results and "error" in file_results[file_id]:
                continue

            final_result = self.aggregate_results(results, metric["type"])
            print(f"[DEBUG] Final result for file_id {file_id}: {final_result}")
            logging.info(f"Final result for metric '{metric['name']}' in file_id {file_id}: {final_result}")
            file_results[file_id] = {
                "metric": metric["name"],
                "result": final_result,
                "metricId": metric["id"],
                "llm_response": llm_response,
                "context": [
                    {
                        "text": chunk["chunk_text"],
                        "file_id": chunk["file_id"],
                        "start_time": chunk["start_time"],
                        "end_time": chunk["end_time"],
                        "sentiment": chunk.get("sentiment"),
                        "keywords": chunk.get("chunk_keywords"),
                    }
                    for chunk in chunks
                ],
            }

        return file_results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a metric for a file.")
    parser.add_argument("--fileId", required=True, help="File IDs to process the metric (comma-separated).")
    parser.add_argument("--process_metric", required=True, help="Metric to process (JSON string).")
    args = parser.parse_args()

    file_ids = args.fileId.split(",")
    metric = json.loads(args.process_metric)

    db = connectDB()["test"]
    processor = MetricProcessor(db)

    try:
        result = processor.process_metric(file_ids, metric)
        print(json.dumps(result, indent=4))
        logging.info(f"Processed metric successfully: {result}")
    except Exception as e:
        error_msg = {"error": str(e)}
        print(json.dumps(error_msg, indent=4))
        logging.error(f"Error processing metric: {str(e)}")