import json
from utils_python.connect_db import connectDB

class MetricSuggester:
    def __init__(self, db):
        """
        Initialize MetricSuggester with a database instance.
        :param db: MongoDB database instance.
        """
        self.chunk_collection = db["chunk_embeddings"]

    def suggest_metrics(self, file_id):
        """
        Suggest metrics based on the given file_id.
        This function fetches the chunk metadata from the database and generates suggestions.
        :param file_id: The ID of the file for which metrics are to be suggested.
        :return: List of suggested metrics or an error message.
        """
        # 1. Fetch chunks for the given file_id
        chunks = list(self.chunk_collection.find({"file_id": file_id}))

        if not chunks:
            return {"error": "No chunks found for the given file_id."}

        # 2. Example logic for generating metric suggestions
        suggestions = []

        # 2a. Sentiment Distribution
        sentiment_labels = [chunk["sentiment"]["label"] for chunk in chunks if "sentiment" in chunk]
        positive_count = sentiment_labels.count("POSITIVE")
        negative_count = sentiment_labels.count("NEGATIVE")
        if positive_count + negative_count > 0:
            suggestions.append({
                "id": "sentiment_distribution",
                "name": "Sentiment Distribution",
                "type": "Yes/No",
                "description": f"Analyze sentiment distribution: {positive_count} positive, {negative_count} negative."
            })

        # 2b. Topics
        topics = set(chunk["topic"] for chunk in chunks if "topic" in chunk)
        for topic in topics:
            suggestions.append({
                "id": f"topic_{topic.lower()}",
                "name": f"Topic Coverage: {topic}",
                "type": "Yes/No",
                "description": f"Check coverage of topic '{topic}' in the conversation."
            })

        # 2c. Keywords
        keywords = {}
        for chunk in chunks:
            for keyword_data in chunk.get("chunk_keywords", []):
                keyword = keyword_data["keyword"]
                keywords[keyword] = keywords.get(keyword, 0) + 1

        # Suggest top 5 keywords (or more if needed)
        for keyword, count in sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:5]:
            suggestions.append({
                "id": f"keyword_{keyword.lower()}",
                "name": f"Keyword Mentions: {keyword}",
                "type": "Numeric",
                "description": f"Count how many times the keyword '{keyword}' was mentioned ({count} mentions)."
            })

        # 2d. Potential Affirmation or Agreement metric (illustration)
        # If we detect a chunk or segment with words like "Yes, I understand" => might propose:
        # "Did the customer express agreement or understanding?" (Yes/No)
        # (Pseudo code checking partial snippet)
        for chunk in chunks:
            if "affirmation" in chunk.get("chunk_keywords", []):
                suggestions.append({
                    "id": "affirmation_check",
                    "name": "Did the user express affirmation?",
                    "type": "Yes/No",
                    "description": "Check if the user or customer expressed affirmation or acceptance."
                })
                break

        return suggestions

if __name__ == "__main__":
    # Example usage:
    db = connectDB()["test"]
    suggester = MetricSuggester(db)
    file_id = "6774212334d030b19ef2c385"
    result = suggester.suggest_metrics(file_id)
    print(json.dumps(result, indent=4))