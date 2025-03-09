import subprocess

def compile_and_run(code, language):
    if language == 'python':
        return _run_python(code)
    elif language == 'c':
        return _run_c(code)
    return "", "Unsupported language."

def _run_python(code):
    try:
        result = subprocess.run(
            ['python', '-c', code],  # Changed 'python3' to 'python' for compatibility
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            timeout=5  # Prevent infinite loops
        )
        return result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return "", "Execution timed out."
    except Exception as e:
        return "", f"Error: {str(e)}"

def _run_c(code):
    try:
        with open('temp.c', 'w') as f:
            f.write(code)

        compile_result = subprocess.run(
            ['gcc', 'temp.c', '-o', 'temp'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        if compile_result.returncode != 0:
            return "", compile_result.stderr.strip()
        
        run_result = subprocess.run(
            ['./temp'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            timeout=5  # Prevent infinite loops
        )
        return run_result.stdout.strip(), run_result.stderr.strip()
    except subprocess.TimeoutExpired:
        return "", "Execution timed out."
    except Exception as e:
        return "", f"Error: {str(e)}"
