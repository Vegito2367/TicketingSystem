
from simplegmail import Gmail
import os.path
import base64
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from supabase import create_client, Client
import uuid

import os
from dotenv import load_dotenv
load_dotenv()

url= os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_OLD_API_KEY")
supabase: Client = create_client(url, key) # type: ignore


class Ticket:
    def __init__(self, fromEmail, subject,description,emailID):
        self.emailID=emailID
        self.fromEmail = fromEmail
        self.description = description
        self.subject = subject


def createTickets(tickets: list[Ticket]):
    count=0
    for tick in tickets:
        checkResponse = supabase.table("Tickets").select("*").eq("emailID",tick.emailID).limit(1).execute()
        if(len(checkResponse.data)>0):
            continue
        pushRes = supabase.table("Tickets").insert({
            "id":str(uuid.uuid4()),
            "from": tick.fromEmail,
            "subject": tick.subject,
            "description": tick.description,
            "emailID": tick.emailID
        }).execute()
        count+=1
    return count

    
def find_body_part(parts):
    """
    Recursive function to find the 'text/plain' part from a list of message parts.
    """
    for part in parts:
        # If the mimeType is text/plain, we've found our body
        if part.get('mimeType') == 'text/plain' and 'data' in part.get('body', {}):
            return part['body']['data']
        # If the part has its own 'parts', recurse into them
        if 'parts' in part:
            data = find_body_part(part['parts'])
            if data:
                return data
    # If no text/plain part is found after checking all parts
    return None

def get_email_body(msg):
    """
    Decodes and returns the body of an email.
    It prioritizes the 'text/plain' part of the message.
    """
    try:
        payload = msg.get('payload')
        if not payload:
            return None

        # For multipart messages, the payload will have a 'parts' key.
        if 'parts' in payload:
            data = find_body_part(payload['parts'])
        else:
            # For single-part messages, the data is in the 'body' key.
            data = payload.get('body', {}).get('data')

        if data:
            # The data is base64url encoded, so we need to decode it.
            return base64.urlsafe_b64decode(data).decode('utf-8')

    except Exception as e:
        print(f"Error decoding email body: {e}")

    # As a fallback if no text/plain body is found, return the snippet.
    return msg.get('snippet')

def get_label_id_by_name(service, label_name):
    """
    Gets the ID of a label by its display name.
    """
    try:
        results = service.users().labels().list(userId='me').execute()
        labels = results.get('labels', [])
        for label in labels:
            if label['name'].lower() == label_name.lower():
                return label['id']
        print(f"Label '{label_name}' not found.")
    except HttpError as error:
        print(f'An error occurred while fetching labels: {error}')
    return None


SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# creds = Credentials.from_authorized_user_file('./server/client_real_secret.json', SCOPES)
flow = InstalledAppFlow.from_client_secrets_file('./server/client_real_secret.json', SCOPES)
creds = flow.run_local_server(port=0)

with open('token.json', 'w') as token:
  token.write(creds.to_json())
# gmail=Gmail(client_secret_file="./server/client_real_secret.json")

service = build('gmail', 'v1', credentials=creds)
label_id = get_label_id_by_name(service, "Ticketing")


results = service.users().messages().list(userId='me', labelIds=[label_id], maxResults=3).execute()
messages = results.get('messages', [])
tickets: list[Ticket]=[]

print('Recent emails in your Inbox:')

for message in messages:
    msg = service.users().messages().get(userId='me', id=message['id']).execute()
    messageId = msg['id']
    payload = msg['payload']
    headers = payload.get("headers")

    body = get_email_body(msg)

    

    subject = ""
    sender = ""

    for header in headers:
        if header['name'] == 'Subject':
            subject = header['value']
        if header['name'] == 'From':
            sender = header['value']
    
    print(f"From: {sender}")
    print(f"Subject: {subject}")
    # print(f"Body: {body}")
    print("-" * 30)
    tickets.append(Ticket(sender,subject,body,messageId))

print("Tickets created =",createTickets(tickets))

# Save the credentials for the next run
