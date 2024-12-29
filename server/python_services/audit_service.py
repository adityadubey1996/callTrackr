# services/audit_service.py
import json
import re
from langchain import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from langchain_groq import ChatGroq
from langchain.docstore.document import Document
from utils_python.audit_parameters import AuditParameters, JSONExtractor
# from config import Config

class AuditTranscript:
    def __init__(self, groq_api_key, refine_template, model_name="llama3-70b-8192", temperature=0):
        self.llm = ChatGroq(temperature=temperature, groq_api_key=groq_api_key, model_name=model_name)
        self.refine_template = refine_template

    def get_refine_audit_response(self, transcript):
        doc_transcript = [Document(page_content=t) for t in transcript]

        prompt_template = """Write a concise summary of the following:
        {text}
        CONCISE SUMMARY:"""
        prompt = PromptTemplate.from_template(prompt_template)

        refine_prompt = PromptTemplate.from_template(self.refine_template)
        print(refine_prompt)

        chain = load_summarize_chain(
            llm=self.llm,
            chain_type="refine",
            question_prompt=prompt,
            refine_prompt=refine_prompt,
            return_intermediate_steps=True,
            input_key="input_documents",
            output_key="output_text",
        )
        result = chain({"input_documents": doc_transcript}, return_only_outputs=True)

        return result

class AuditService:
    def __init__(self, audit_parameters, summary):
        self.audit_parameters = audit_parameters
        self.summary = summary

    def generate_audit_report(self):
        report = {
            "template_name": self.audit_parameters['template_name'],
            "purpose": self.audit_parameters['purpose'],
            "industry": self.audit_parameters.get('industry', 'Not specified'),
            "number_of_speakers": self.audit_parameters['num_speakers'],
            "compliance_requirements": self.audit_parameters.get('compliance_requirements', 'None'),
            "analysis_types": self.audit_parameters['analysis_types'],
            "metrics": self.audit_parameters['metrics'],
            "summary": self.summary
        }
        return report