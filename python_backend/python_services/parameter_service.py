# services/parameter_service.py
import json

class ParameterService:
    def __init__(self):
        pass

    def get_parameters(self):
        # For simplicity, we'll use hardcoded parameters.
        # You can modify this method to accept user input or read from a config file.
        answers_str = json.dumps([
            {
                "question": "What is the primary purpose of this recording?",
                "answerSelected": "Training"
            },
            {
                "question": "Is this recording related to a specific industry or domain?",
                "answerSelected": "Yes",
                "textInfoTyped": "Healthcare"
            },
            {
                "question": "Approximately how many speakers are involved in this recording?",
                "answerSelected": "3"
            },
            {
                "question": "Would you like us to analyze the content for any specific compliance requirements?",
                "answerSelected": "Yes",
                "textInfoTyped": "HIPAA"
            },
            {
                "question": "Select the types of analysis you would like us to perform on the recording:",
                "answerSelected": [
                    "Speaker talk time ratios — Analyze the proportion of talk time per participant.",
                    "Sentiment analysis — Assess the sentiment (positive, neutral, negative) of each speaker.",
                    "Custom analysis — Specify any additional or particular insights you need."
                ],
                "textInfoTyped": {
                    "Custom analysis — Specify any additional or particular insights you need.": "Identify key compliance breaches."
                }
            },
            {
                "question": "Let's give the template a name before creating it",
                "answerSelected": "Healthcare Training Audit"
            }
        ])
        return answers_str