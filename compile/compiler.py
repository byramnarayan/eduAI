import subprocess

def compile_and_run(code, language):
    if language == 'python':
        return _run_python(code)
    elif language == 'c':
        return _run_c(code)
    # Add support for more languages as needed

def _run_python(code):
    try:
        result = subprocess.run(['python3', '-c', code], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        return result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return '', e.stderr

def _run_c(code):
    try:
        with open('temp.c', 'w') as f:
            f.write(code)
        result = subprocess.run(['gcc', 'temp.c', '-o', 'temp'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        if result.returncode == 0:
            result = subprocess.run(['./temp'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
            return result.stdout, result.stderr
        else:
            return '', result.stderr
    except subprocess.CalledProcessError as e:
        return '', e.stderr
