"""
CPF validation utility using external API.
Validates CPF format and checks validity via external service.
"""
import requests
from rest_framework import serializers


def validate_cpf_external(cpf: str) -> bool:
    """
    Validate CPF using external API.
    CPF should be in format: XXX.XXX.XXX-XX
    
    Uses a free CPF validation API. Returns True if valid, False otherwise.
    """
    try:
        # Remove formatting for API call
        cpf_clean = cpf.replace('.', '').replace('-', '')
        
        # Use a free CPF validation API
        # https://www.receitaws.com.br/v1/cpf/{cpf}
        response = requests.get(
            f"https://www.receitaws.com.br/v1/cpf/{cpf_clean}",
            timeout=5
        )
        
        # Check if response is successful
        if response.status_code == 200:
            data = response.json()
            # API returns status 'ok' if CPF is valid
            return data.get('status') == 'ok'
        else:
            # If API is unavailable, allow registration (graceful degradation)
            # In production, you might want different behavior
            return True
            
    except requests.RequestException:
        # If external API is down, allow registration (graceful degradation)
        return True
    except Exception:
        # Any other error, allow registration
        return True


def validate_cpf_format(cpf: str) -> bool:
    """
    Validate CPF format (must be XXX.XXX.XXX-XX).
    Returns True if format is valid, False otherwise.
    """
    import re
    pattern = r'^\d{3}\.\d{3}\.\d{3}-\d{2}$'
    return bool(re.match(pattern, cpf))
