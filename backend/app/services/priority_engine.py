"""
Priority Engine Service
Calculates a priority score (0-100) for petitions using a rule-based system.
Factors: category severity, urgency keywords, sentiment intensity, text detail level.
"""
from app.services.ai_classifier import get_sentiment


# Base priority weights per category (some categories are inherently more urgent)
CATEGORY_BASE_SCORES = {
    'public_safety': 40,
    'corruption': 35,
    'healthcare': 30,
    'infrastructure': 25,
    'environment': 22,
    'legal': 20,
    'education': 18,
    'other': 15,
}

# Urgency keywords that indicate critical situations
URGENCY_KEYWORDS = {
    'critical': ['emergency', 'urgent', 'immediately', 'critical', 'life-threatening',
                 'dying', 'death', 'collapse', 'explosion', 'crisis'],
    'high': ['danger', 'dangerous', 'severe', 'serious', 'alarming', 'hazardous',
             'threatening', 'escalating', 'worsening', 'unbearable'],
    'moderate': ['concern', 'worried', 'problem', 'issue', 'complaint',
                 'deteriorating', 'unresolved', 'persistent', 'recurring'],
}


def calculate_priority(text: str, category: str) -> dict:
    """
    Calculate priority score and label for a petition.
    
    Score breakdown (0-100):
    - Category base score: 0-40
    - Urgency keyword bonus: 0-30
    - Sentiment intensity bonus: 0-15
    - Detail level bonus: 0-15
    
    Returns:
        dict with 'score' (float), 'priority' (str), and 'breakdown' (dict)
    """
    if not text or not text.strip():
        return {'score': 0, 'priority': 'low', 'breakdown': {}}

    text_lower = text.lower()
    breakdown = {}

    # 1. Category base score
    category_score = CATEGORY_BASE_SCORES.get(category, 15)
    breakdown['category'] = category_score

    # 2. Urgency keyword detection
    urgency_score = 0
    for level, keywords in URGENCY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                if level == 'critical':
                    urgency_score = max(urgency_score, 30)
                elif level == 'high':
                    urgency_score = max(urgency_score, 20)
                elif level == 'moderate':
                    urgency_score = max(urgency_score, 10)
    breakdown['urgency'] = urgency_score

    # 3. Sentiment intensity — more negative = more urgent
    sentiment = get_sentiment(text)
    polarity = sentiment['polarity']
    
    # Map polarity (-1 to 1) to score (0 to 15), negative = higher score
    if polarity < -0.5:
        sentiment_score = 15
    elif polarity < -0.2:
        sentiment_score = 10
    elif polarity < 0:
        sentiment_score = 5
    else:
        sentiment_score = 0
    breakdown['sentiment'] = sentiment_score

    # 4. Detail level — longer, more detailed petitions may indicate severity
    word_count = len(text.split())
    if word_count > 200:
        detail_score = 15
    elif word_count > 100:
        detail_score = 10
    elif word_count > 50:
        detail_score = 5
    else:
        detail_score = 2
    breakdown['detail'] = detail_score

    # Calculate total score (cap at 100)
    total_score = min(category_score + urgency_score + sentiment_score + detail_score, 100)

    # Map score to priority label
    if total_score >= 76:
        priority = 'critical'
    elif total_score >= 51:
        priority = 'high'
    elif total_score >= 26:
        priority = 'medium'
    else:
        priority = 'low'

    return {
        'score': round(total_score, 2),
        'priority': priority,
        'breakdown': breakdown,
    }
