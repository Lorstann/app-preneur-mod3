import mimetypes
from uuid import UUID

import boto3
from botocore.client import BaseClient

from app.core.settings import settings

ALLOWED_CONTENT_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
}


def get_s3_client() -> BaseClient:
    return boto3.client("s3", region_name=settings.aws_region)


def validate_file_type(filename: str, content_type: str) -> str:
    guessed_type, _ = mimetypes.guess_type(filename)
    normalized = content_type or guessed_type
    if normalized not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Only .pdf, .docx, and .doc files are allowed.")
    return ALLOWED_CONTENT_TYPES[normalized]


def build_s3_key(org_id: UUID, scope_id: UUID, document_id: UUID, version: int, ext: str) -> str:
    return f"{org_id}/{scope_id}/{document_id}/{version}.{ext}"


def create_upload_url(s3_key: str, content_type: str, expires: int = 900) -> str:
    client = get_s3_client()
    return client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.aws_s3_bucket,
            "Key": s3_key,
            "ContentType": content_type,
            "ServerSideEncryption": "AES256",
        },
        ExpiresIn=expires,
    )
