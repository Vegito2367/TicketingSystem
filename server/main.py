from gmailClient import GmailClient
import uuid
from ticket import Ticket
from supabaseClient import SupabaseClient


def createTickets(tickets: list[Ticket]):
    count=0
    for tick in tickets:
        checkResponse = supabase.table("Tickets").select("*").eq("emailID",tick.emailID).limit(1).execute()
        if(len(checkResponse.data)>0):
            continue
        try:
            pushRes = supabase.table("Tickets").insert({
                "id":str(uuid.uuid4()),
                "from": tick.fromEmail,
                "subject": tick.subject,
                "description": tick.description,
                "emailID": tick.emailID
            }).execute()
            count+=1
        except Exception as e:
            print(f"Error inserting ticket: {e}")
            continue
    return count

############################################################

supabase = SupabaseClient().get()
print("Supabase client initialized.\n\n")

mailClient= GmailClient(label_name="Ticketing")
results = mailClient.service.users().messages().list(userId='me', labelIds=[mailClient.label_id], maxResults=3).execute()
messages = results.get('messages', [])
tickets: list[Ticket]=[]

print('Recent emails in your Inbox:')

for message in messages:
    msg = mailClient.service.users().messages().get(userId='me', id=message['id']).execute()
    messageId = msg['id']
    payload = msg['payload']
    headers = payload.get("headers")

    body = mailClient.get_email_body(msg)
    
    subject = ""
    sender = ""

    for header in headers:
        if header['name'] == 'Subject':
            subject = header['value']
        if header['name'] == 'From':
            sender = header['value']
    
    print(f"From: {sender}")
    print(f"Subject: {subject}")
    print("-" * 30)
    tickets.append(Ticket(sender,subject,body,messageId))

print("Tickets created =",createTickets(tickets))

