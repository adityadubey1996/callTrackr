import argparse
import json
import re
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def extract_json(content):
    """
    Extract JSON content from the response using regex.
    :param content: The raw string content from the LLM.
    :return: Extracted JSON string or raises a ValueError.
    """
    # Match content enclosed in { ... } ensuring valid JSON structure
    match = re.search(r"(\{.*?\})", content, re.DOTALL)
    if match:
        return match.group(1)  # Return the JSON-like content
    raise ValueError("No valid JSON found in the response.")



def validate_metric_logically(metric):
    """
    Validate a metric's name and type to ensure logical consistency.
    """
    name = metric.get("name", "").lower()
    metric_type = metric.get("type", "").lower()

    if not name or not metric_type:
        return {
            "valid": False,
            "message": "Metric name and type are required."
        }

    if metric_type == "yes/no":
        if name.startswith("was") or name.startswith("did"):
            return {"valid": True, "message": "Valid Yes/No metric."}
        else:
            return {"valid": False, "message": "Yes/No metrics should be questions like 'Was X...' or 'Did Y...'."}

    if metric_type == "numeric":
        if "how many" in name or "number of" in name:
            return {"valid": True, "message": "Valid Numeric metric."}
        else:
            return {"valid": False, "message": "Numeric metrics should ask for a count, e.g., 'How many...'"}

    if metric_type == "text":
        if name.startswith("what") or name.startswith("describe"):
            return {"valid": True, "message": "Valid Text metric."}
        else:
            return {"valid": False, "message": "Text metrics should ask for descriptions, e.g., 'What is...'"}

    return {"valid": False, "message": "Unknown metric type or invalid name."}

def validate_metric_with_llm(metric):
    """
    Use an LLM to validate the metric name and type.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {
            "valid": False,
            "message": "LLM validation failed: GROQ_API_KEY not configured."
        }

    client = Groq(api_key=api_key)

    prompt = f"""
    Validate the following metric:
    Metric Name: "{metric.get('name')}"
    Metric Type: "{metric.get('type')}"
    Ensure that the metric name logically aligns with the type. For example:
    - Yes/No type metrics should be questions like 'Was pricing discussed?'
    - Numeric type metrics should ask for counts like 'How many times was X mentioned?'
    - Text type metrics should ask for descriptions like 'What was the customer's feedback?'
  Respond ONLY with a JSON object in the following format:
{{
    "valid": true/false,
    "message": "Explanation of the validation result."
}}
Do not include any extra text or formatting.
    """
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}]
        )

        # Extract the content
        content = response.choices[0].message.content.strip()

        # Extract JSON using regex
        json_content = extract_json(content)

        # Parse JSON
        result = json.loads(json_content)
        return result

    except json.JSONDecodeError as json_error:
        print("Error parsing JSON:", str(json_error))
        return {
            "valid": False,
            "message": "LLM validation failed: Invalid JSON format in response."
        }
    except ValueError as val_error:
        print("Content Validation Error:", str(val_error))
        return {
            "valid": False,
            "message": f"LLM validation failed: {str(val_error)}"
        }
    except Exception as e:
        print("Unexpected error:", str(e))
        return {
            "valid": False,
            "message": f"LLM validation failed: {str(e)}"
        }
def validate_metric(metric):
    """
    Validate a single metric using both logical and LLM checks.
    """
    # logical_result = validate_metric_logically(metric)
    # if not logical_result["valid"]:
    #     return logical_result
    # print('logical_result', logical_result)
    llm_result = validate_metric_with_llm(metric)
    print('llm_result', llm_result)

    if isinstance(llm_result, dict) and not llm_result.get("valid", False):
        return llm_result

    return {"valid": True, "message": "Metric is valid according to both logical and LLM checks."}

def validate_metrics_list(metrics):
    """
    Validate a list of metrics and return results with IDs as references.
    """
    print('metric', metrics)
    results = []
    for metric in metrics:
        metric_id = metric.get("id")
        if not metric_id:
            results.append({
                "id": None,
                "valid": False,
                "message": "Metric ID is required for tracking."
            })
            continue
        print('metric', metric)

        validation_result = validate_metric(metric)
        validation_result["id"] = metric_id
        results.append(validation_result)

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate metrics (list or single).")
    parser.add_argument("--metrics", required=True, help="Metrics JSON string to validate.")
    args = parser.parse_args()

    try:
        metrics = json.loads(args.metrics)
        if not isinstance(metrics, list):
            raise ValueError("Input must be a JSON array of metrics.")
        results = validate_metrics_list(metrics)
        print(f"VALIDATION_RESULTS: {json.dumps(results, indent=4)}")
    except Exception as e:
        print(json.dumps({"valid": False, "message": str(e)}))