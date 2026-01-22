

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from api import router as api_router
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(api_router)

# This part is crucial so your React app can talk to your API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    return {"message": "FastAPI is running with SQLite!"}

