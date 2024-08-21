from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, moodlogs, schedules, analytics

app = FastAPI()
app.include_router(auth.router)
app.include_router(moodlogs.router)
app.include_router(schedules.router)
app.include_router(analytics.router)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test")
async def test():
    return {"app": "Moodit"}


# if __name__ == "__main__":
#     uvicorn.run("src.main:app", host="0.0.0.0", port=8080, log_level="info", reload=True)
