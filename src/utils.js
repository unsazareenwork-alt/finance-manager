// src/utils.js
export const getPrediction = (data) => {
    const n = data.length;
    if (n < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    data.forEach((item, index) => {
        const x = index + 1;
        sumX += x;
        sumY += item.amount;
        sumXY += (x * item.amount);
        sumXX += (x * x);
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return (slope * (n + 1)) + intercept;
};