from simplegmail import Gmail
import os.path
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError



class GmailClient:
    """A client for interacting with the Gmail API."""
    def __init__(self, label_name="Ticketing"):
        self.gmail = Gmail(client_secret_file="./server/client_real_secret.json")
        self.service = self.build_service()
        if not self.service:
            raise Exception("Failed to create Gmail service.")
        self.label_name = label_name
        self.label_id = self.get_label_id_by_name(label_name)

    def get_credentials(self):
        """ Retrieves the user's credentials for accessing Gmail API.
        If no valid credentials are found, it initiates the OAuth flow to obtain them.
        """
        SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
        creds = None
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        return creds

    def build_service(self):
        """Builds the Gmail service."""        
        try:
            service = build('gmail', 'v1', credentials=self.get_credentials())
            return service
        except HttpError as error:
            print(f'An error occurred: {error}')
            return None
    
    def get_label_id_by_name(self, label_name):
        """
        Gets the ID of a label by its display name.
        """
        try:
            results = self.service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            for label in labels:
                if label['name'].lower() == label_name.lower():
                    return label['id']
            print(f"Label '{label_name}' not found.")
        except HttpError as error:
            print(f'An error occurred while fetching labels: {error}')
        return None

    def find_body_part(self, parts):
        """
        Recursive function to find the 'text/plain' part from a list of message parts.
        """
        for part in parts:
            # If the mimeType is text/plain, we've found our body
            if part.get('mimeType') == 'text/plain' and 'data' in part.get('body', {}):
                return part['body']['data']
            # If the part has its own 'parts', recurse into them
            if 'parts' in part:
                data = self.find_body_part(part['parts'])
                if data:
                    return data
        # If no text/plain part is found after checking all parts
        return None

    def get_email_body(self, msg):
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
                data = self.find_body_part(payload['parts'])
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
