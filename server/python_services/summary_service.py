# services/summary_service.py
import openai
# from config import Config
from groq import Groq

class SummaryService:
    def __init__(self, api_key):
        self.api_key = api_key
        self.groq_client = Groq(api_key=self.api_key)

    def convert_message_to_prompt_format(self,user_prompt):

        messages = [
            # {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        return messages

    def generate_summary(self,prompt):
        try:
            print("API_KEY: ",self.api_key)
            chat_completion = self.groq_client.chat.completions.create(
                messages=self.convert_message_to_prompt_format(prompt),
                model="llama-3.1-8b-instant",
                temperature=0
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error in get_llama3_groq_response: {e}")
            return "An error occurred while processing your request."