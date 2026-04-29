"""
AI Classifier Service
Classifies petitions into categories using keyword analysis and sentiment detection.
Designed to be swappable with a transformer model (BERT, etc.) in production.
"""
from textblob import TextBlob


# Category keyword mappings — weighted terms for each category
CATEGORY_KEYWORDS = {
    'infrastructure': [
        'road', 'bridge', 'building', 'construction', 'pothole', 'drainage',
        'water supply', 'electricity', 'power outage', 'sewage', 'dam',
        'highway', 'pavement', 'streetlight', 'traffic signal', 'pipeline',
    ],
    'corruption': [
        'bribe', 'corrupt', 'fraud', 'embezzlement', 'scam', 'misuse',
        'nepotism', 'kickback', 'money laundering', 'illegal', 'theft',
        'misconduct', 'abuse of power', 'favoritism',
    ],
    'public_safety': [
        'crime', 'theft', 'murder', 'assault', 'robbery', 'violence',
        'harassment', 'accident', 'fire', 'flood', 'disaster', 'emergency',
        'danger', 'threat', 'unsafe', 'security', 'police', 'rescue',
    ],
    'education': [
        'school', 'college', 'university', 'teacher', 'student', 'exam',
        'curriculum', 'scholarship', 'education', 'library', 'classroom',
        'tuition', 'literacy', 'training', 'admission',
    ],
    'healthcare': [
        'hospital', 'doctor', 'medicine', 'health', 'disease', 'clinic',
        'patient', 'treatment', 'vaccine', 'medical', 'ambulance', 'nurse',
        'pharmacy', 'surgery', 'epidemic', 'pandemic', 'sanitation',
    ],
    'environment': [
        'pollution', 'waste', 'garbage', 'deforestation', 'climate',
        'emission', 'toxic', 'contamination', 'wildlife', 'ecosystem',
        'recycling', 'green', 'carbon', 'plastic', 'chemical',
    ],
    'legal': [
        'law', 'court', 'judge', 'lawyer', 'justice', 'rights', 'petition',
        'appeal', 'verdict', 'hearing', 'regulation', 'compliance',
        'license', 'permit', 'legislation', 'lawsuit',
    ],
}


def classify_petition(text: str) -> dict:
    """
    Classify a petition text into a category.
    
    Uses a two-stage approach:
    1. Keyword frequency analysis — counts matches per category
    2. Sentiment analysis — provides additional context
    
    Returns:
        dict with 'category' (str) and 'confidence' (float 0-1)
    """
    if not text or not text.strip():
        return {'category': 'other', 'confidence': 0.0}

    text_lower = text.lower()
    
    # Stage 1: Keyword matching — count hits per category
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            if keyword in text_lower:
                # Multi-word keywords get bonus weight
                weight = 1.5 if ' ' in keyword else 1.0
                score += weight
        scores[category] = score

    # Find the best category
    total_score = sum(scores.values())
    
    if total_score == 0:
        # No keyword matches — fall back to sentiment-based heuristic
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        if polarity < -0.3:
            return {'category': 'public_safety', 'confidence': 0.3}
        else:
            return {'category': 'other', 'confidence': 0.2}

    # Determine winner
    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]
    
    # Calculate confidence as proportion of total keyword hits
    confidence = min(best_score / max(total_score, 1), 1.0)
    
    # Boost confidence if multiple keywords matched in the winning category
    if best_score >= 3:
        confidence = min(confidence + 0.15, 1.0)
    
    # Stage 2: Sentiment refinement
    blob = TextBlob(text)
    
    # Strong negative sentiment slightly boosts confidence for safety/corruption
    if blob.sentiment.polarity < -0.3 and best_category in ('public_safety', 'corruption'):
        confidence = min(confidence + 0.1, 1.0)

    return {
        'category': best_category,
        'confidence': round(confidence, 2),
    }


def get_sentiment(text: str) -> dict:
    """
    Analyze the sentiment of petition text.
    
    Returns:
        dict with 'polarity' (-1 to 1) and 'subjectivity' (0 to 1)
    """
    blob = TextBlob(text)
    return {
        'polarity': round(blob.sentiment.polarity, 3),
        'subjectivity': round(blob.sentiment.subjectivity, 3),
    }
