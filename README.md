# Student Score Prediction

Predicts student exam scores and pass/fail outcomes from study habits and performance indicators using regression and classification models, with results visualized in a Power BI dashboard.

## Overview

This project analyzes student performance data and tackles two related prediction tasks: estimating exact exam scores (regression) and predicting pass/fail outcomes (classification). Multiple models are trained and compared for each task, with findings surfaced through an interactive Power BI dashboard. The goal is to identify which factors most strongly predict performance and how accurately outcomes can be estimated from them.

## Objectives

- Analyze student performance data
- Train and compare regression models to predict exact exam scores
- Train and compare classification models to predict pass/fail outcomes
- Evaluate models using appropriate metrics for each task
- Visualize results and key drivers using Power BI

## Tech Stack

| Category | Tools |
|---|---|
| Language | Python |
| Data handling | Pandas, NumPy |
| Modeling | Scikit-learn |
| Visualization | Matplotlib, Seaborn, Power BI |

## Dataset

Included in this repository as `final_dataset.csv`.

Features:
- Age
- Study Hours per Day
- Social Media Hours
- Netflix Hours
- Part-time Job (Yes/No)
- Attendance Percentage
- Sleep Hours
- Exercise Frequency
- Parental Education Level
- Mental Health Rating
- Extracurricular Participation (Yes/No)
- Entertainment Time
- Health Score
- Gender (one-hot encoded: Female / Male / Other)
- Diet Quality (one-hot encoded: Fair / Good / Poor)
- Internet Quality (one-hot encoded: Average / Good / Poor)

Target variables:
- `exam_score` (continuous) — used for the regression task
- `pass_fail` (binary) — used for the classification task; derived from `exam_score`, where a score of 50 or above is labeled pass (1) and below 50 is labeled fail (0)

The dataset also includes a `predicted_score` column — the regression model's output, used for the predicted-vs-actual visuals in the Power BI dashboard.

## Project Structure

```
Student-Score-Prediction/
├── student_score_prediction.ipynb
├── final_dataset.csv
├── requirements.txt
├── dashboard.pbix
├── screenshots/
│   ├── d1.jpeg
│   ├── d2.jpeg
│   └── d3.jpeg
└── README.md
```

## Installation

```bash
git clone https://github.com/<your-username>/Student-Score-Prediction.git
cd Student-Score-Prediction
pip install -r requirements.txt
```

## Usage

1. Launch the notebook:
   ```bash
   jupyter notebook student_score_prediction.ipynb
   ```
2. Run cells in order to preprocess data, train models, and generate evaluation metrics.
3. Open `dashboard.pbix` in Power BI Desktop to explore the interactive dashboard.

## Methodology

1. Data cleaning and exploratory data analysis
2. Feature engineering: one-hot encoding of categorical features (gender, diet quality, internet quality) and deriving a binary `pass_fail` label from `exam_score` (threshold: score ≥ 50 = pass)
3. Feature analysis (correlation between study habits, lifestyle factors, and exam score)
4. Train/test split
5. **Regression task:** train Linear Regression, Decision Tree Regressor, and Random Forest Regressor to predict exact exam scores — evaluated with MAE, RMSE, R²
6. **Classification task:** train Decision Tree Classifier and Random Forest Classifier to predict pass/fail outcomes — evaluated with accuracy and error rate
7. Dashboard build in Power BI

## Results

**Regression — predicting exam score**

| Model | R² Score | MAE | RMSE |
|---|---|---|---|
| Linear Regression | 0.881 | 4.41 | 5.55 |
| Decision Tree Regressor | 0.673 | 7.28 | 9.21 |
| Random Forest Regressor | 0.859 | 4.73 | 6.05 |

**Best regression model: Linear Regression** — highest R² (0.881) and lowest MAE/RMSE of the three.

**Classification — predicting pass/fail**

| Model | Accuracy | Error Rate |
|---|---|---|
| Decision Tree Classifier | 0.733 | 0.267 |
| Random Forest Classifier | 0.837 | 0.163 |

**Best classification model: Random Forest Classifier** — higher accuracy and lower error rate than the single decision tree, consistent with the ensemble advantage seen in the regression results.

## Power BI Dashboard

![Student analysis overview](screenshots/d1.jpeg)
*Overview of the dataset (1,000 students): average exam score (69.6), attendance (84.1%), study hours, and entertainment time, alongside exam score trends against study hours and mental health rating, exam score vs. entertainment hours, and a part-time job vs. pass/fail breakdown.*

![Regression model comparison](screenshots/d2.jpeg)
*Regression model comparison: Linear Regression is the best performer (R² = 0.88, lowest MAE = 4.41, lowest RMSE = 5.55), benchmarked against Random Forest and Decision Tree.*

![Classification model comparison](screenshots/d3.jpeg)
*Classification model comparison: Random Forest is the best performer (highest accuracy = 0.84, lowest error rate = 0.16), benchmarked against Decision Tree.*

## Future Improvements

- Hyperparameter tuning (GridSearchCV)
- Additional features (e.g. extracurriculars, parental education)
- Deploy as a simple web app (Streamlit/Flask)
