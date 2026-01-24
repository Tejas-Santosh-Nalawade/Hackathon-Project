"""
Backend Setup Verification Script
Run this to check if all files are in place and dependencies are installed.
Does NOT require Groq API key.
"""

import sys
import os
from pathlib import Path

def print_status(message, status):
    """Print colored status message"""
    colors = {
        'ok': '\033[92m✓',      # Green
        'error': '\033[91m✗',   # Red
        'warn': '\033[93m⚠',    # Yellow
        'info': '\033[94mℹ',    # Blue
    }
    reset = '\033[0m'
    symbol = colors.get(status, '')
    print(f"{symbol} {message}{reset}")

def main():
    print("\n" + "="*50)
    print("  Backend Setup Verification")
    print("="*50 + "\n")
    
    all_ok = True
    
    # Check Python version
    py_version = sys.version_info
    if py_version >= (3, 10):
        print_status(f"Python version: {py_version.major}.{py_version.minor}.{py_version.micro}", 'ok')
    else:
        print_status(f"Python version: {py_version.major}.{py_version.minor}.{py_version.micro} (3.10+ recommended)", 'warn')
    
    # Check required files
    required_files = ['main.py', 'bots.py', 'search_utils.py', 'requirements.txt', '.env.example']
    for file in required_files:
        if Path(file).exists():
            print_status(f"File exists: {file}", 'ok')
        else:
            print_status(f"File missing: {file}", 'error')
            all_ok = False
    
    # Check if .env exists
    if Path('.env').exists():
        print_status(".env file exists", 'ok')
        env_ok = True
    else:
        print_status(".env file missing (create from .env.example)", 'warn')
        print_status("  → Backend won't start without .env", 'info')
        env_ok = False
    
    # Check dependencies
    print("\n" + "-"*50)
    print("  Checking Dependencies")
    print("-"*50 + "\n")
    
    dependencies = [
        'fastapi',
        'uvicorn',
        'openai',
        'dotenv',
        'duckduckgo_search',
        'lxml'
    ]
    
    missing_deps = []
    for dep in dependencies:
        try:
            __import__(dep.replace('-', '_'))
            print_status(f"{dep} installed", 'ok')
        except ImportError:
            print_status(f"{dep} not installed", 'error')
            missing_deps.append(dep)
            all_ok = False
    
    # Summary
    print("\n" + "="*50)
    print("  Summary")
    print("="*50 + "\n")
    
    if all_ok and env_ok:
        print_status("All checks passed! Backend is ready to run.", 'ok')
        print("\nTo start the backend:")
        print("  PowerShell: .\\start.ps1")
        print("  Manual:     uvicorn main:app --reload")
    elif all_ok and not env_ok:
        print_status("Setup complete, but .env file needed", 'warn')
        print("\nNext steps:")
        print("  1. Copy .env.example to .env")
        print("  2. Add your Groq API key to .env")
        print("  3. Run: .\\start.ps1")
    else:
        print_status("Setup incomplete", 'error')
        if missing_deps:
            print("\nMissing dependencies:")
            for dep in missing_deps:
                print(f"  - {dep}")
            print("\nTo install:")
            print("  pip install -r requirements.txt")
    
    print()

if __name__ == "__main__":
    main()
