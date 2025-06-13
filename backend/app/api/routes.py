# routes.py

# Necessary imports
from fastapi import APIRouter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.document_loaders import PyPDFLoader
import os
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from langchain_core.runnables import RunnableLambda
import sys

# Base directory (current file's directory)
base_dir = os.path.dirname(__file__)
sys.path.append(os.path.abspath(os.path.join(base_dir, '..', '')))
from app.utils import file_url_to_path, parse_chatMessage_output
from app.schemas import InitSidebarRequest, QueryRequest

load_dotenv()

# Router 
router = APIRouter()

# Making custom output parser
output_parser = RunnableLambda(parse_chatMessage_output)

# docs array -> for storing documents only one time
global_docs = []

# array of chat messages for context 
messages = []

# Defining the chat based PromptTemplate for user query
template = ChatPromptTemplate([
    ("system", 'You are a helpful research assistant who is specialized in answering user queries based on the web/pdf provided '
    'Here is the document : {docs}'
    'Always give answer in 5-10 lines'),
    MessagesPlaceholder("messages"),
    ("user", "{query}")
])

# Langchain Models -> For now I am using Google Gemini since it is free
chat_model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash"
)

# Building output pipeline through chain -> This is a sequential chain
response_genration_chain = template | chat_model | output_parser

# Route for first initilization -> When sidebar opens
@router.post("/init")
async def init_sidebar(request: InitSidebarRequest):
    global_docs.clear()  # Clear previous documents
    messages.clear()
    type = request.type.lower()
    if type not in ['pdf', 'web']:
        return {"error": "Invalid type. Must be 'pdf' or 'web'."}
    if type == 'pdf':
        file_path = file_url_to_path(request.url)
        pdf_loader = PyPDFLoader(file_path)
        docs = pdf_loader.load()
    elif type== 'web':
        web_loader = WebBaseLoader(request.url)
        docs = web_loader.load()

    global_docs.extend(docs)
    return {
        "message": "Sidebar initialized successfully",
        "url": request.url,
        "type": request.type,
        "docs_count": len(docs)
    }

# Route for chating with user
@router.post("/chat/user-query")
async def user_query(query : QueryRequest):
    chain_output = response_genration_chain.invoke({'docs': global_docs, 'query': query.query['text'], 'messages': messages})
    final_response = chain_output
    messages.append(('user', query.query['text']))
    messages.append(('assistant', final_response))
    return {'success': True, 'response':  final_response}

