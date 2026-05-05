import json
import logging
from datetime import datetime, timezone


class JsonLineFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
        }

        message = record.getMessage()
        try:
            parsed = json.loads(message)
            if isinstance(parsed, dict):
                payload.update(parsed)
            else:
                payload["message"] = message
        except json.JSONDecodeError:
            payload["message"] = message

        return json.dumps(payload, default=str)


def configure_security_audit_logger() -> None:
    logger = logging.getLogger("security.audit")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    handler = logging.StreamHandler()
    handler.setFormatter(JsonLineFormatter())

    logger.handlers.clear()
    logger.addHandler(handler)
