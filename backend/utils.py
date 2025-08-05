import json
import re
from typing import List, Dict


def format_context(search_results: List[Dict]) -> str:
    context = "Relevant Facts:\n"
    for res in search_results:
        context += f"From {res['filename']} (relevance: {res['score']:.2f}):\n"
        if isinstance(res["content"], dict):
            for k, v in res["content"].items():
                context += f"- {k}: {v}\n"
        else:
            context += f"{res['content']}\n"
        context += "\n"
    return context


def parse_uploaded_file(uploaded_file):
    try:
        if uploaded_file.name.endswith(".json"):
            return json.load(uploaded_file)
        else:
            return uploaded_file.read().decode("utf-8")
    except Exception as e:
        return None


def parse_synthesis(text: str) -> dict:
    sections = {
        "summary": "",
        "opportunities": [],
        "risks": [],
        "actions": [],
        "recommendation": "",
        "confidence": "",
    }

    def extract_section(section_tag):
        if f"[{section_tag}]" in text:
            content = text.split(f"[{section_tag}]")[1].split("[")[0].strip()
            return [
                line.replace("-", "").strip()
                for line in content.split("\n")
                if line.strip() and (line.startswith("-") or line[0].isdigit())
            ]
        return []

    sections["summary"] = (
        text.split("[Summary]")[1].split("[")[0].strip() if "[Summary]" in text else ""
    )
    sections["opportunities"] = extract_section("Opportunities")
    sections["risks"] = extract_section("Risks")
    sections["actions"] = extract_section("Action Plan")
    # TODO: use for quantifying
    # sections["bullet_count"] = count_bullet_points(text)

    if "[Recommendation]" in text:
        rec_text = text.split("[Recommendation]")[1].split("\n")[0].strip()
        sections["recommendation"] = (
            rec_text[0].upper() + rec_text[1:] if rec_text else ""
        )

    if "[Confidence]" in text:
        conf_text = text.split("[Confidence]")[1].strip()
        if "%" in conf_text:
            sections["confidence"] = conf_text.split("%")[0].strip() + "%"

    return sections


def extract_sections(text):
    sections = {
        "summary": "",
        "opportunities": [],
        "risks": [],
        "actions": [],
        "recommendation": "",
        "confidence": "",
    }

    # Fallback
    if "[Summary]" not in text:
        sections["summary"] = text.split("\n\n")[0] if text else "No summary available"

    opp_patterns = ["[Opportunities]", "Opportunities:", "Key advantages:"]
    for pattern in opp_patterns:
        if pattern in text:
            opp_content = text.split(pattern)[1].split("\n\n")[0]
            sections["opportunities"] = [
                line.strip()
                for line in opp_content.split("\n")
                if line.strip() and (line.startswith("-") or line[0].isdigit())
            ]
            break

    return sections
