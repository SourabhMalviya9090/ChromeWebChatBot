from pydantic import BaseModel
from typing import Dict, Any
# Defining the schema for initilization object this will be used when we first open the bot
class InitSidebarRequest(BaseModel):
    url: str
    type: str  # 'pdf' or 'web'

# Extracting the req.body and validating in the given format
class QueryRequest(BaseModel):
    query: Dict[str, Any] 