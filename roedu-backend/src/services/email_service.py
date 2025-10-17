from fastapi import BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel
from typing import List

class EmailSchema(BaseModel):
    subject: str
    recipients: List[str]
    body: str
    html: str = None

class EmailService:
    def __init__(self, config: ConnectionConfig):
        self.mail = FastMail(config)

    async def send_email(self, email: EmailSchema, background_tasks: BackgroundTasks):
        message = MessageSchema(
            subject=email.subject,
            recipients=email.recipients,
            body=email.body,
            html=email.html
        )
        background_tasks.add_task(self.mail.send_message, message)

# Configuration for email service
conf = ConnectionConfig(
    MAIL_USERNAME="your_email@example.com",
    MAIL_PASSWORD="your_password",
    MAIL_FROM="your_email@example.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.example.com",
    MAIL_FROM_NAME="RoEdu",
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

email_service = EmailService(conf)