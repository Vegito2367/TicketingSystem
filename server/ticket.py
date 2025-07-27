
class Ticket:
    def __init__(self, fromEmail : str, subject : str, description : str, emailID : str):
        """
        Ticket Model class
        """
        self.emailID=emailID
        self.fromEmail = fromEmail
        self.description = description
        self.subject = subject