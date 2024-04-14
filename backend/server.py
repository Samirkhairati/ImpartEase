from fastapi import FastAPI, Body, UploadFile, File
import fitz  # PyMuPDF
from ai import get_ai_response, convert_pdf_to_text
from youtube_transcript_api import YouTubeTranscriptApi
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
import os, io

load_dotenv()
IMPARTUS_TOKEN = os.getenv("IMPARTUS_TOKEN")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ImpartEase API", description="API for ImpartEase", version="0.1")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_summary(text):
    """
    Creates a summary of the input text.
    """
    return get_ai_response(
        "Summarize this lecture into 1 page notes in md format, use subheadings and bulleted points and emojis: \n\n"
        + text
    )


def generate_quiz(text, difficulty="medium", num_questions=5):
    """
    Generates a quiz from the input text.
    """
    PROMPT = (
        "Generate a quiz from the following text: \n\n"
        + text
        + f"\n\nThe format of the quiz should be multiple choice questions. Return {num_questions} {difficulty} level questions as a python list EXACTLY in this format, example:" + "[{'question': 'What is the capital of France?', 'options': ['Paris', 'London', 'Berlin', 'Madrid'], 'answer': 'Paris'}, ...]"
    )
    res = get_ai_response(PROMPT)
    # Parse the response
    try:
        questions = eval(res)
    except SyntaxError:
        return generate_quiz(text)
    return questions


def extract_text_from_pdf(pdf_file):
    """
    Extracts text from a PDF file.
    """
    text = ""
    with fitz.open(stream=pdf_file.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()

    if not text:
        print("No text found in PDF file")
        pdf_file.seek(0)
        text = convert_pdf_to_text(pdf_file.read())
    return text

def fetch_impartus_pdf(impartus_video_link):
    """
    Fetches the PDF from the Impartus video link.
    """
    video_id = impartus_video_link.split("/")[-1]
    
    url = f"https://a.impartus.com/api/videos/{video_id}/auto-generated-pdf"
    response = requests.get(url, headers={"Authorization": f"Bearer {IMPARTUS_TOKEN}"})


    io_bytes = io.BytesIO(response.content)
    return io_bytes
    

def extract_transcript_from_youtube(youtube_link):
    """
    Extracts the transcript from a YouTube video.
    """

    video_id = youtube_link.split("=")[-1]
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    text = ""
    for line in transcript:
        text += line["text"] + " "
    return text


@app.post("/generate/summary/pdf")
async def generate_summary_pdf(pdf_file: UploadFile = File(...)):
    """
    Accepts a PDF file and returns the summary as a text response.
    """
    try:
        text = extract_text_from_pdf(pdf_file.file)
        summary = create_summary(text)
    except Exception as e:
        return {"error": str(e)}
    return {"summary": summary}

class Link(BaseModel):
    link: str


@app.post("/generate/summary/youtube")
async def generate_summary_youtube(youtube_link: Link):
    """
    Accepts a YouTube link and returns the summary as a text response.
    """
    # Extract text from YouTube video
    try:

        text = extract_transcript_from_youtube(youtube_link.link)

        summary = create_summary(text)
    except Exception as e:
        return {"error": str(e)}

    # Generate summary
    return {"summary": summary}

@app.post("/generate/summary/impartus")
async def generate_summary_impartus(impartus_video_link: Link):
    """
    Accepts a text file and returns the summary as a text response.
    """
    try:
        imp_pdf = fetch_impartus_pdf(impartus_video_link.link)
        text = extract_text_from_pdf(imp_pdf)
        summary = create_summary(text)
    except Exception as e:
        return {"error": str(e)}
    return {"summary": summary}

class Text(BaseModel):
    text: str
    difficulty: str = "medium"
    num_questions: int = 5

@app.post("/generate/quiz/")
async def generate_quiz_endpoint(text: Text):
    """
    Accepts a PDF file and returns a quiz as a text response.
    """
    quiz = generate_quiz(text.text, text.difficulty, text.num_questions)
    return {"quiz": quiz}


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
