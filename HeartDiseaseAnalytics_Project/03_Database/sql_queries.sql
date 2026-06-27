
-- =========================
-- 1. CREATE DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS HeartDiseaseDB;
USE HeartDiseaseDB;

-- =========================
-- 2. CREATE TABLE
-- =========================
CREATE TABLE IF NOT EXISTS heart_disease_uci (
    id INT,
    age INT,
    sex VARCHAR(10),
    dataset VARCHAR(50),
    cp INT,
    trestbps INT,
    chol INT,
    fbs INT,
    restecg INT,
    thalch INT,
    exang INT,
    oldpeak FLOAT,
    slope INT,
    ca INT,
    thal INT,
    num INT
);

-- =========================
-- 3. DATA CHECK
-- =========================
SELECT COUNT(*) AS total_records FROM heart_disease_uci;

SELECT * FROM heart_disease_uci LIMIT 10;

-- =========================
-- 4. ANALYSIS QUERIES
-- =========================

-- Gender (sex) distribution
SELECT sex, COUNT(*) AS total
FROM heart_disease_uci
GROUP BY sex;

-- Chest pain type
SELECT cp, COUNT(*) AS total
FROM heart_disease_uci
GROUP BY cp;

-- Heart disease distribution
SELECT num, COUNT(*) AS total
FROM heart_disease_uci
GROUP BY num;

-- Average health metrics
SELECT 
AVG(age) AS avg_age,
AVG(chol) AS avg_cholesterol,
AVG(trestbps) AS avg_bp
FROM heart_disease_uci;

-- Fasting blood sugar
SELECT fbs, COUNT(*) AS total
FROM heart_disease_uci
GROUP BY fbs;

-- Exercise angina
SELECT exang, COUNT(*) AS total
FROM heart_disease_uci
GROUP BY exang;

-- ST slope
SELECT slope, COUNT(*) AS total
FROM heart_disease_uci
GROUP BY slope;

-- Vessels (ca)
SELECT ca, COUNT(*) AS total
FROM heart_disease_uci
GROUP BY ca;

-- Thal
SELECT thal, COUNT(*) AS total
FROM heart_disease_uci
GROUP BY thal;

-- Age group analysis
SELECT 
CASE 
    WHEN age < 30 THEN '20-30'
    WHEN age < 40 THEN '30-40'
    WHEN age < 50 THEN '40-50'
    WHEN age < 60 THEN '50-60'
    ELSE '60+'
END AS age_group,
num,
COUNT(*) AS total
FROM heart_disease_uci
GROUP BY age_group, num;

-- Quick view
SELECT age, sex, cp, chol, trestbps, thalch, exang, num
FROM heart_disease_uci
LIMIT 10;
