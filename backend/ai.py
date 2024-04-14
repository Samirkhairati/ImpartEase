import convertapi
import os
from dotenv import load_dotenv
import openai

load_dotenv()
convertapi.api_secret = os.getenv("CONVERT_API_KEY")

openAIClient = openai.OpenAI()


def get_ai_response(text):
    chat_completion = openAIClient.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": text,
            }
        ],
        model="gpt-3.5-turbo",
    )

    return chat_completion.choices[0].message.content


def convert_pdf_to_text(file_bytes):
    upload_io = convertapi.UploadIO(file_bytes, "result.pdf")
    return (
        convertapi.convert("txt", {"File": upload_io}, from_format="pdf")
        .file.io.read()
        .decode("utf-8")
    )
