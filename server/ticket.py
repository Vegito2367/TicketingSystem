
class Ticket:
    def __init__(self, fromEmail, subject,description,emailID):
        self.emailID=emailID
        self.fromEmail = fromEmail
        self.description = description
        self.subject = subject