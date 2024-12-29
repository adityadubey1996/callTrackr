# utils/audit_parameters.py
import json
import re
from langchain import PromptTemplate
from langchain.text_splitter import CharacterTextSplitter

class AuditParameters:
    @staticmethod
    def determine_audit_parameters(answers_str):
        answers = json.loads(answers_str)
        audit_parameters = {
            "purpose": None,
            "industry": None,
            "num_speakers": None,
            "compliance_requirements": None,
            "analysis_types": [],
            "template_name": None,
            "metrics": []
        }

        for answer in answers:
            question = answer['question']
            response = answer['answerSelected']
            follow_up = answer.get('textInfoTyped')

            if question == "What is the primary purpose of this recording?":
                audit_parameters['purpose'] = response

            elif question == "Is this recording related to a specific industry or domain?":
                if response == "Yes":
                    audit_parameters['industry'] = follow_up
                else:
                    audit_parameters['industry'] = "General"

            elif question == "Approximately how many speakers are involved in this recording?":
                audit_parameters['num_speakers'] = int(response)

            elif question == "Would you like us to analyze the content for any specific compliance requirements?":
                if response == "Yes":
                    audit_parameters['compliance_requirements'] = follow_up
                else:
                    audit_parameters['compliance_requirements'] = None

            elif question == "Select the types of analysis you would like us to perform on the recording:":
                audit_parameters['analysis_types'] = response
                if follow_up:
                    audit_parameters['custom_analysis'] = follow_up.get("Custom analysis — Specify any additional or particular insights you need.")

            elif question == "Let's give the template a name before creating it":
                audit_parameters['template_name'] = response

        # Determine metrics based on analysis types
        if "Speaker talk time ratios — Analyze the proportion of talk time per participant." in audit_parameters['analysis_types']:
            audit_parameters['metrics'].append("Speaker Talk Time Ratios")

        if "Key topics discussed — Identify main topics covered in the conversation." in audit_parameters['analysis_types']:
            audit_parameters['metrics'].append("Key Topics Discussed")

        if "Sentiment analysis — Assess the sentiment (positive, neutral, negative) of each speaker." in audit_parameters['analysis_types']:
            audit_parameters['metrics'].append("Sentiment Analysis")

        if "Compliance issue tracking — Highlight potential compliance risks or violations mentioned." in audit_parameters['analysis_types']:
            audit_parameters['metrics'].append("Compliance Issue Tracking")

        if "Custom analysis — Specify any additional or particular insights you need." in audit_parameters['analysis_types']:
            audit_parameters['metrics'].append("Custom Analysis")

        return audit_parameters

    @staticmethod
    def generate_summary_prompt(audit_parameters, existing_summary, transcript_chunk):
        prompt = (
            "Your job is to produce a final summary of the video/audio file based on the following parameters:\n"
            f"- Purpose: {audit_parameters['purpose']}\n"
            f"- Industry: {audit_parameters.get('industry', 'Not specified')}\n"
            f"- Number of Speakers: {audit_parameters['num_speakers']}\n"
            f"- Compliance Requirements: {audit_parameters.get('compliance_requirements', 'None')}\n"
            f"- Analysis Types: {', '.join(audit_parameters['analysis_types'])}\n"
            f"- Template Name: {audit_parameters['template_name']}\n"
            "------------\n"
            "Existing summary up to this point:\n"
            f"{existing_summary}\n"
            "------------\n"
            "We have the opportunity to refine the existing summary with some more context below:\n"
            "------------\n"
            f"{transcript_chunk}\n"
            "------------\n"
            "Given the new context, refine the original summary. If the context isn't useful, return the original summary.\n"
            "Include timestamps WHENEVER you are giving any EXAMPLE or REFERENCE."
        )
        return prompt

class JSONExtractor:
    @staticmethod
    def extract_json_from_string(input_string):
        json_match = re.search(r'\{.*\}', input_string, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print("Invalid JSON:", e)
                return None
        else:
            print("No JSON found in the input string.")
            return None

class TranscriptSplitter:
    @staticmethod
    def split_transcript_by_tokens(transcript, max_tokens=4000):
        def tokenize(text):
            return text.split()

        def detokenize(tokens):
            return ' '.join(tokens)

        lines = re.findall(r'Time: (\d+\.\d+ \– \d+\.\d+ \[ .+?\])', transcript)

        text_splitter = CharacterTextSplitter(
            separator=" ",
            chunk_size=max_tokens,
            chunk_overlap=0,
            length_function=lambda x: len(tokenize(x))
        )

        chunks = []
        current_chunk = []
        current_tokens = 0

        for line in lines:
            line_tokens = tokenize(line)
            line_token_count = len(line_tokens)

            if current_tokens + line_token_count > max_tokens:
                chunks.append(detokenize(current_chunk))
                current_chunk = line_tokens
                current_tokens = line_token_count
            else:
                current_chunk.extend(line_tokens)
                current_tokens += line_token_count

        if current_chunk:
            chunks.append(detokenize(current_chunk))

        return chunks