# 🧠 Student Mental Health Prediction

A Machine Learning-based web application that predicts students' mental health scores based on their lifestyle, academic activities, and social media usage patterns.

## 📌 Project Overview

Student Mental Health Prediction is a machine learning project developed to analyze the relationship between students' daily habits, social media usage, academic activities, and mental health.

The project uses a trained Machine Learning model integrated with FastAPI to generate predictions based on user-provided information.

## ✨ Features

- Predicts student mental health scores using a trained ML model.
- Analyzes lifestyle and social media usage patterns.
- Accepts student information through an API.
- Uses Pydantic for input validation.
- Provides real-time predictions through FastAPI.
- Includes an interactive frontend for user input and prediction results.

## 🛠️ Technologies Used

- **Python** – Core programming language
- **Pandas & NumPy** – Data manipulation and numerical operations
- **Scikit-learn** – Machine Learning model
- **FastAPI** – Backend API development
- **Pydantic** – Data validation
- **Joblib** – Model loading and serialization
- **HTML, CSS, JavaScript** – Frontend (if applicable)

## 📊 Input Features

The model uses the following student-related features:

- Age
- Gender
- Country
- Academic Level
- Most Used Social Media Platform
- Purpose of Social Media Usage
- Average Daily Usage Hours
- Daily Unlocks
- Study Hours
- Physical Activity Hours
- Sleep Hours Per Night
- Stress Level

## 📁 Project Structure

```text
Mental-health-Prediction/
│
├── main.py
├── Mental_health_model.pkl
├── requirements.txt
├── README.md
│
└── frontend/
    └── (Frontend files)
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dishasharma16/Mental-health-Prediction.git
```

### 2. Navigate to the Project Directory

```bash
cd Mental-health-Prediction
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

### 4. Activate the Virtual Environment

For Windows:

```bash
venv\Scripts\activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Run the FastAPI Server

```bash
uvicorn main:app --reload --port 2200
```

### 7. Open API Documentation

Visit the following URL in your browser:

http://127.0.0.1:2200/docs

## 🔗 API Details

**Endpoint:** `/predict`

**Method:** `POST`

The API accepts student information in JSON format and returns the predicted mental health score.

## 🚀 Future Improvements

- Improve prediction accuracy through model optimization.
- Add more data visualizations.
- Deploy the application online.
- Enhance frontend design and user experience.

## ⚠️ Disclaimer

This project is developed for educational purposes. The predicted score is not a clinical diagnosis and should not replace professional mental health assessment.

## 👩‍💻 Author

**Disha Sharma**

GitHub: [dishasharma16](https://github.com/dishasharma16)

---

⭐ If you find this project interesting, feel free to explore the repository!
