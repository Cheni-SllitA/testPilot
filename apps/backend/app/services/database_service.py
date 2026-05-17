from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(SUPABASE_URL)
print(SUPABASE_KEY)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)