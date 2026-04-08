import httpx
import os

# As requested by the user:
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "sk_38f9cb475c4e249250499a35ef329964cd3274e132a912bc")
VOICE_ID = "RGb96Dcl0k5eVje8EBch"

async def elevenlabs_tts_stream(text: str):
    """
    Calls the ElevenLabs streaming endpoint and yields audio bytes.
    Uses eleven_multilingual_v2 for Hinglish safety and robustness.
    """
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/stream"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5, 
            "similarity_boost": 0.8
        }
    }
    
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", url, headers=headers, json=payload) as response:
            if response.status_code != 200:
                # Read the error so we can log it if needed
                error_body = await response.aread()
                print(f"[ElevenLabs Error] {response.status_code}: {error_body}")
                yield b"" # Yield empty bytes to avoid crashing the stream gracefully
                return
            
            async for chunk in response.aiter_bytes(chunk_size=1024):
                if chunk:
                    yield chunk
