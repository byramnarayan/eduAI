
## Project Demo:
<a href="https://youtu.be/Yti7aN_XRtk" target="_blank" rel="noopener noreferrer">
  <img src="https://github.com/byramnarayan/eduAI/blob/main/media/profile_pics/image.png" alt="eduAI Demo" width="700">
</a>
# Project Setup Guide
This guide explains how to create a virtual environment, install dependencies, and run the Django project.

## **1. Create and Activate a Virtual Environment**
Run the following commands in your terminal:

```sh
# Create a virtual environment (using venv)
python -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

## **2. Install Dependencies**
Make sure `requirements.txt` is in the root directory of your project, then run:

```sh
pip install -r requirements.txt
```

## **3. Apply Migrations**
Before running the project, apply database migrations:

```sh
python manage.py migrate
```

## **4. Run the Django Development Server**
Use the following command to start the server:

```sh
python manage.py runserver
```

Now, open your browser and visit:
👉 http://127.0.0.1:8000/


