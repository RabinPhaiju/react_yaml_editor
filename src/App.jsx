import { useEffect, useState } from "react";
import useLocalStorage from "./components/useLocalStorage";
import "./App.css";
import parser from "js-yaml";
import { YamlEditor } from "./yamlEditor";
import yaml from 'yaml';
import getKeys from "./getKeys";

export default function App() {
  const template1 = `
- template: &likely                  
    - paragraph: |
        
`;
  const template2 = `
- template: &basic_description_title
    - paragraph:
        end: ""
        content:
          - text: "### Basic Description"

- template: &prediction_title
    - paragraph:
        end: ""
        content:
          - text: "### Prediction"

- template: &advice_title
    - paragraph:
        end: ""
        content:
          - text: "### Advice"

- template: &additional_note_title
    - paragraph:
        end: ""
        content:
          - text: "### Additional Note"

- template: &likely                  
    - text: *basic_description_title
    - paragraph: |
        
`;

const template3 = `
- paragraph: |
    

`;

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

const [contextSuggestions, setContextSuggestions] = useState([]);
const [partialSuggestions, setPartialSuggestions] = useState(defaultSuggestions);
const [linkSuggestions, setLinkSuggestions] = useState([]);
const [anchorSuggestions,setAnchorSuggestions] = useState();
const [publicData, setPublicData] = useLocalStorage("public", template1)
const [privateData, setPrivateData] = useLocalStorage("private", template2)
const [data, setData] = useState(template3);
const [currentTab,setCurrentTab] = useLocalStorage("tab", "public");

useEffect(()=>{
  updateSuggestions(contextSuggestion,partialContextSuggestion,externalLink);
},[])

const  updateSuggestions =((context,partial_context,externalLink) => {
  let context_suggestions = [context].flatMap(obj => getKeys(obj,'text','context'));
  let _link_suggestion = [externalLink].flatMap(obj => getKeys(obj,'text','link'));

  let _context_suggestion = [];
  context_suggestions.forEach((suggestion) => {          
    _context_suggestion.push(suggestion);
  })
  let partial_suggestions = [partial_context].flatMap(obj => getKeys(obj,'text','generic'));
  setContextSuggestions(prev => [...prev,..._context_suggestion]);
  setPartialSuggestions(prev => [...prev,...partial_suggestions]);
  setLinkSuggestions(prev => [...prev,..._link_suggestion]);
})

useEffect(()=>{
  const regex = new RegExp(/&\w+?\w+/,'g');
  let newData = data?.match(regex);
  if(newData !=null){
    const _anchorSuggestions = [];
    newData.forEach(anchor=>{
       anchor = anchor.substring(1);
      _anchorSuggestions.push({label: anchor, type: 'text', apply: anchor, detail: 'anchor'});
    })
    setAnchorSuggestions(_anchorSuggestions);
  }
},[data])


const changeYamlData = (value,cTab) => {
  if(cTab === "public"){
    setPublicData(prev=>( value ));
  }else if(cTab === "private"){
    setPrivateData(prev=>( value ));
  }else{
    setData(prev=>( value ));
  }
}
const saveYaml = (e) => {}

const findAndReplaceYourToTheir = () => {
  if(currentTab === "public"){
    setPublicData(publicData.replace(/\b[Yy]our(?!self\b)/g, '{{their}}'));
  }else if(currentTab === "private"){
    setPrivateData(privateData.replace(/\b[Yy]our(?!self\b)/g, '{{their}}'));
  }else{
    setData(data.replace(/\b[Yy]our(?!self\b)/g, '{{their}}'));
  }
}

const findAndReplaceYourSelfToThemSelf = () => {
  if(currentTab === "public"){
    setPublicData(publicData.replace(/\b[Yy]ourself/g, '{{themself}}'));
  }else if(currentTab === "private"){
    setPrivateData(privateData.replace(/\b[Yy]ourself/g, '{{themself}}'));
  }else{
    setData(data.replace(/\b[Yy]ourself/g, '{{themself}}'));
  }
}

  return (
    <div className="App">
        <div style={{position:'relative'}} >
        <div className="nav">
          <div>
            <button style={currentTab === "public" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => setCurrentTab("public")}>Public</button>
            <button style={currentTab === "private" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => setCurrentTab("private")}>Private</button>
            <button style={currentTab === "data" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => setCurrentTab("data")}>Other</button>
          </div>
          <div className="buttons">
            <button className="button-19" onClick={findAndReplaceYourToTheir}>Your-Their</button>
            <button className="button-19" onClick={findAndReplaceYourSelfToThemSelf}>YourSelf-ThemSelf</button>
          </div>
        </div>

        <YamlEditor 
          data={
            currentTab === "public" 
              ? publicData ?? ''
              : currentTab === "private" 
                ? privateData ?? ''
                : data.length > 0 
                  ? data 
                  : ''
          } 
          currentTab={currentTab}
          onChange={changeYamlData} 
          saveYaml={saveYaml} 
          contextSuggestions={contextSuggestions}
          partialSuggestions={partialSuggestions}
          anchorSuggestions = {anchorSuggestions}
          linkSuggestions={linkSuggestions}
          />
        </div>
    </div>
  );
}
