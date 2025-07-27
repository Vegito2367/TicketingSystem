import os
from dotenv import load_dotenv
from supabase import create_client, Client

class SupabaseClient():
    load_dotenv()
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_OLD_API_KEY")
        self.supabase = Client(self.url, self.key)  
    
    def get(self):
        return self.supabase