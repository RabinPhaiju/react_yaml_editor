const partialContextSuggestion = {
    "generic/suggestions": "",
    "generic/private_chat_link":'',
    "header_content":'',
    "bottom_content":'',
    "simple_algorithm/astrological_insight_link":'',
    "simple_algorithm/astrological_insigth": "",
    "timeline/dates_and": "",
    "timeline/dates_to": "",
    "question/description_suggestions": "",
  } 
  
  const defaultSuggestions = [ 
    // {label: "case", type: "text", apply:'case: '},      
    // {label: "options", type: "keyword", apply:'options: '},       
    // {label: "content", type: "keyword", apply:'content: '},  
  ]; 
  
  const linkSuggestion = [
    {label: "test", type: "text",apply:'test.com', detail: "expression"},
  ]
  
  const externalLink = {
    "House 1,house": "",
    "House 2,house": "",
    "House 3,house": "",
    "House 4,house": "",
    "House 5,house": "",
    "House 6,house": "",
    "House 7,house": "",
    "House 8,house": "",
    "House 9,house": "",
    "House 10,house": "",
    "House 11,house": "",
    "House 12,house": "",
    "Ascendant,planet": "",
    "Sun,planet": "",
    "Moon,planet": "",
    "Mercury,planet": "",
    "Venus,planet": "",
    "Mars,planet": "",
    "Jupiter,planet": "",
    "Saturn,planet": "",
    "Uranus,planet": "",
    "Neptune,planet": "",
    "Pluto,planet": "",
    "Rahu,planet": "",
    "Rahu (True),planet": "",
    "Ketu,planet": "",
    "Ketu (True),planet": "",
    "Aries,ascendant": "",
    "Taurus,ascendant": "",
    "Gemini,ascendant": "",
    "Cancer,ascendant": "",
    "Leo,ascendant": "",
    "Virgo,ascendant": "",
    "Libra,ascendant": "",
    "Scorpio,ascendant": "",
    "Sagittarius,ascendant": "",
    "Capricorn,ascendant": "",
    "Aquarius,ascendant": "",
    "Pisces,ascendant": "",
    "D1,chart": "",
    "D6,chart": "",
    "D7,chart": "",
    "D8,chart": "",
    "D9,chart": "",
    "D10,chart": "",
    "D11,chart": "",
    "D12,chart": "",
    "D16,chart": "",
    "D20,chart": "",
    "D24,chart": "",
    "D27,chart": "",
    "D30,chart": "",
    "D40,chart": "",
    "D45,chart": "",
    "D60,chart": "",
    "D2,chart": "",
    "D3,chart": "",
    "D4,chart": "",
    "D5,chart": "",
    "faq,ext_link": "",
    "aspects,ext_link": "",
    "conjunction,ext_link": "",
    "transits,ext_link": "",
    "ashtottari_dasha,ext_link": "",
    "chara_dasha,ext_link": "",
    "trivagi_dasha,ext_link": "",
    "yogini_dasha,ext_link": "",
    "vimshottari_dasha,ext_link": "",
    "mutable_signs,ext_link": "",
    "fixed_signs,ext_link": "",
    "movable_signs,ext_link": "",
    "maha_dasha,ext_link": "",
    "antar_dasha,ext_link": "",
    "pratyantar_dasha,ext_link": "",
    "planet_strength,ext_link": "",
    "horoscope,ext_link": "",
    "divisional_chart,ext_link": "",
    "sun_sign,ext_link": "",
    "moon_sign,ext_link": "",
    "planet_friendship,ext_link": "",
    "ask,ext_link": "",
    "blog,ext_link": "",
    "prashna_kundali,ext_link": "",
    "tiktok,ext_link": "",
    "facebook,ext_link": "",
    "twitter,ext_link": "",
    "youtube,ext_link": "",
    "instagram,ext_link": "",
    "Aries,zodiac": "",
    "Taurus,zodiac": "",
    "Gemini,zodiac": "",
    "Cancer,zodiac": "",
    "Leo,zodiac": "",
    "Virgo,zodiac": "",
    "Libra,zodiac": "",
    "Scorpio,zodiac": "",
    "Sagittarius,zodiac": "",
    "Capricorn,zodiac": "",
    "Aquarius,zodiac": "",
    "Pisces,zodiac": ""
  }
  
  const contextSuggestion = {
    "scope_algorithm": {
      "result": [],
      "has_result": true,
      "result_count": 2,
      "scope": "planet",
      "top_result": "Jupiter"
  },
    "activation_strength": {
        "activated_planets": [],
        "top_activated_planets": [],
        "transit_planets": [],
        "is_positive": true
    },
    "age": 1,
    "ascendant": "",
    "birth_profile_id": 4,
    "connection_algorithm": {
        "related_planets": [],
        "connected_planets": [],
        "matched_planets": [],
        "indicator_planets": [],
        "has_relations": false
    },
    "count_suggestions": 0,
    "first_name": "",
    "full_name": "",
    "gender": "male",
    "has_alternative": false,
    "has_have": "have",
    "has_suggestions": false,
    "is_are": "are",
    "is_gender_male": true,
    "is_initial_answer": true,
    "is_positive": true,
    "is_prashna_kundali": false,
    "is_private": false,
    "is_self": true,
    "moon_sign": "",
    "native": "you",
    "native's": "your",
    "post_id": "",
    "primary_house": {
        "name": "5",
        "value": 5
    },
    "primary_kundali": "D1",
    "question_id": 4,
    "relationship": "Self",
    "standard": {
        "percent": 0,
        "grading": ""
    },
    "sun_sign": "",
    "their": "your",
    "them": "you",
    "themself": "yourself",
    "they": "you",
    "timeline": {
        "events": [],
        "count_events": 0,
        "has_events": false,
        "limit_in_years": 0.25,
        "limit_in_words": "",
        "limit_date": "",
        "period_in_words":"",
    },
    "user_id": 8,
    "has_multiple_suggestions":"",
  }
  
  export {contextSuggestion, partialContextSuggestion, defaultSuggestions, externalLink}