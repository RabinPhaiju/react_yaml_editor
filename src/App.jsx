import { useEffect, useState } from "react";
import "./App.css";
import parser from "js-yaml";
import { YamlEditor } from "./yamlEditor";
import yaml from 'yaml';
import getKeys from "./getKeys";

export default function App() {
  const templateData = `
- references:
    - name: prashna_kundali
      content:
        - ext_link:
            code: prashna_kundali
            source: ext_link
            
    - name: primary_house
      content:
        - ext_link:
            code: '{{primary_house.name}}'
            source: house
            
    - name: transit
      content:
        - action_link: 
            name: 'free-astrology:transit'
            auth: user
            params:
                user_id: '{{user_id}}'
                birth_profile_id: '{{birth_profile_id}}'

- template: &boy-girl
  - switch_case:
      case: '{{ gender }}'
      options:
          male:
              - text: 'girl'
          female:
              - text: 'boy'
            
- template: &he-she
  - switch_case:
      case: '{{ gender }}'
      options:
          male: 
              - text: 'she'
          female:
              - text: 'he'
            
- template: &him-her
  - switch_case:
      case: '{{ gender }}'
      options:
          male:
              - text: 'her'
          female:
              - paragraph: |
                  At PocketPandit, we employ our unique and innovative Vedic astrology calculations. Based on our analyses, we have determined that the prospects of {{them}} making a significant investment are considered below average. Unfortunately, this calculation indicates that it may be challenging for {{them}} to make a substantial investment. From an astrological perspective, the window of opportunity to make a significant investment may be limited to a narrower range of potential dates.jdkfdj fkdjf.
`;

const contextSuggestion = {
  "ascendant": "Virgo",
  "birth_profile_id": 810,
  "count_suggestions": 0,
  "first_name": "Raj",
  "full_name": "Raj Malhotra",
  "gender": "male",
  "has_alternative": false,
  "has_suggestions": false,
  "is_gender_male": true,
  "is_prashna_kundali": false,
  "is_self": true,
  "moon_sign": "Aries",
  "native": "you",
  "native's": "your",
  "planet_activation": {
      "top_activated_planets": [
          "Saturn",
          "Jupiter",
          "Venus"
      ],
      "top_activated_planet_data": [
          {
              "name": "Saturn",
              "value": 7
          },
          {
              "name": "Jupiter",
              "value": 6
          },
          {
              "name": "Venus",
              "value": 4
          }
      ],
      "transit_planets": [
          "Venus",
          "Moon"
      ],
      "transiting_planet_data": [
          {
              "name": "Venus",
              "value": 4
          },
          {
              "name": "Moon",
              "value": 2
          }
      ]
  },
  "post_id": null,
  "primary_house": {
      "name": "House 11",
      "value": 11
  },
  "primary_kundali": "D1",
  "question_id": 231,
  "relationship": "Self",
  "simple_algorithm": {
      "yogas": [],
      "kundalies": [
          "D1",
          "D9"
      ],
      "houses": [
          "House 11",
          "House 1",
          "House 5"
      ]
  },
  "standard": {
      "percent": 53.8,
      "grading": "average"
  },
  "sun_sign": "Sagittarius",
  "their": "your",
  "them": "you",
  "themself": "yourself",
  "they": "you",
  "timeline": {
      "events": [
          {
              "index": 1,
              "name": "Sun-Rahu-Venus",
              "different_end_date": true,
              "start_date": "April 2049",
              "end_date": "June 2049",
              "has_transit": false,
              "planet_in_transit": null
          },
          {
              "index": 2,
              "name": "Sun-Rahu-Jupiter",
              "different_end_date": true,
              "start_date": "October 2048",
              "end_date": "December 2048",
              "has_transit": false,
              "planet_in_transit": null
          },
          {
              "index": 3,
              "name": "Sun-Mercury-Venus",
              "different_end_date": true,
              "start_date": "July 2051",
              "end_date": "August 2051",
              "has_transit": false,
              "planet_in_transit": null
          }
      ],
      "count_events": 3,
      "has_events": true,
      "limit_in_years": 10,
      "limit_date": "Jan 2052"
  },
  "user_id": 1
}

const genericSuggestion = {
  "generic/suggestions": "",
  "ref/prashna_kundali": "https://pocketpandit.com/blog/posts/article/question-birth-chart-prashna-kundali-in-vedic-astrology/",
  "ref/primary_house": "https://pocketpandit.com/blog/posts/article/11th-house-in-astrology/",
  "ref/transit": "https://staging.pocketpandit.com/action-link?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rpb24iOiJmcmVlLWFzdHJvbG9neTp0cmFuc2l0IiwiYXV0aCI6InVzZXIiLCJwYXlsb2FkIjp7InVzZXJfaWQiOjEsImJpcnRoX3Byb2ZpbGVfaWQiOjgxMH0sImV4cCI6MTY5NTE3ODQ3Nn0.CbahKOGQRA8NvkWzxYjmPr71TF4ZTI4gUKctaWqrtDU",
  "simple_algorithm/bullet_points": "\n\nHere are some details of your **Birth chart** \n\n1. You are [Virgo ascendant](https://pocketpandit.com/blog/posts/article/virgo-ascendant-kanya-lagna/), your [Sun sign](https://pocketpandit.com/blog/posts/article/sun-sign-in-vedic-astrology/) is [Sagittarius](https://pocketpandit.com/blog/posts/article/sagittarius-in-vedic-astrology/) and [Moon sign](https://pocketpandit.com/blog/posts/article/moon-sign-in-vedic-astrology/) is [Aries](https://pocketpandit.com/blog/posts/article/aries-in-vedic-astrology/). \n\n2. You have no planets sitting in the [11th house](https://pocketpandit.com/blog/posts/article/11th-house-in-astrology/) and is being aspected by [Venus](https://pocketpandit.com/blog/posts/article/venus-in-vedic-astrology-shukra-in-vedic-astrology/), [Saturn](https://pocketpandit.com/blog/posts/article/saturn-in-vedic-astrology-shani-in-vedic-astrology/) and [Jupiter](https://pocketpandit.com/blog/posts/article/jupiter-in-vedic-astrology-brihaspati-in-vedic-astrology/). \n\n3. The sign of your [11th House](https://pocketpandit.com/blog/posts/article/11th-house-in-astrology/) is [Cancer](https://pocketpandit.com/blog/posts/article/cancer-in-vedic-astrology/) and its lord is [Moon](https://pocketpandit.com/blog/posts/article/the-moon-in-vedic-astrology-chandra-in-vedic-astrology/). \n\n4. [Moon](https://pocketpandit.com/blog/posts/article/the-moon-in-vedic-astrology-chandra-in-vedic-astrology/), the lord of your [11th House](https://pocketpandit.com/blog/posts/article/11th-house-in-astrology/), is placed in the [8th House](https://pocketpandit.com/blog/posts/article/8th-house-in-astrology/) which is neutral sign to [Aries](https://pocketpandit.com/blog/posts/article/aries-in-vedic-astrology/). \n\n5. [Venus](https://pocketpandit.com/blog/posts/article/venus-in-vedic-astrology-shukra-in-vedic-astrology/) - representing girlfriend - reside in the [5th house](https://pocketpandit.com/blog/posts/article/5th-house-in-astrology/). \n\n6. The current time period you are in is the [Ketu-Rahu](https://staging.pocketpandit.com/action-link?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rpb24iOiJmcmVlLWFzdHJvbG9neTp2aW1zaG90dGFyaS1kYXNoYSIsImF1dGgiOiJ1c2VyIiwicGF5bG9hZCI6eyJkYXNoYV9zZXF1ZW5jZSI6IlswLCA1XSIsInVzZXJfaWQiOjEsImJpcnRoX3Byb2ZpbGVfaWQiOjgxMH0sImV4cCI6MTY5NTE3ODQ3Nn0.ywhmxQvA_5PlFp2yTWzng4tXOslnVAAzMW4FIxAq8vM) period. \n\n7. The [current transit](https://staging.pocketpandit.com/action-link?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rpb24iOiJmcmVlLWFzdHJvbG9neTp0cmFuc2l0IiwiYXV0aCI6InVzZXIiLCJwYXlsb2FkIjp7InVzZXJfaWQiOjEsImJpcnRoX3Byb2ZpbGVfaWQiOjgxMH0sImV4cCI6MTY5NTE3ODQ3Nn0.CbahKOGQRA8NvkWzxYjmPr71TF4ZTI4gUKctaWqrtDU) in your [11th House](https://pocketpandit.com/blog/posts/article/11th-house-in-astrology/) is of [Venus](https://pocketpandit.com/blog/posts/article/venus-in-vedic-astrology-shukra-in-vedic-astrology/) at the moment. \n\nIn addition to your birth chart, we have also considered your [D9](https://pocketpandit.com/blog/posts/article/d-9-in-vedic-astrology/) chart, which provides further insights. For more detailed information about this divisional chart, please refer to the [provided link](https://staging.pocketpandit.com/action-link?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rpb24iOiJpbnN0YW50LXByZWRpY3Rpb246Y2hhcnRfZGVzY3JpcHRpb25zX2xpbmsiLCJhdXRoIjoicHVibGljIiwicGF5bG9hZCI6eyJwb3N0X2lkIjoiIiwidXNlcl9pZCI6MX0sImV4cCI6MTY5NTE3ODQ3Nn0.1mvkArMxmoIXzf7NtaHcmEzV5sl6aBYn3Fr44iG0AP4).",
  "simple_algorithm/kundali_house_description": "\n\n1. [**Birth chart(D1)**](https://pocketpandit.com/blog/posts/article/d-1-chart-in-vedic-astrology/) and its **[1st House](https://pocketpandit.com/blog/posts/article/1st-house-in-astrology/)**, **[5th House](https://pocketpandit.com/blog/posts/article/5th-house-in-astrology/)** and **[11th House](https://pocketpandit.com/blog/posts/article/11th-house-in-astrology/)** \n\n2. [**Relationship chart(D9)**](https://pocketpandit.com/blog/posts/article/d-9-in-vedic-astrology/) and its **[1st House](https://pocketpandit.com/blog/posts/article/1st-house-in-astrology/)**, **[5th House](https://pocketpandit.com/blog/posts/article/5th-house-in-astrology/)** and **[11th House](https://pocketpandit.com/blog/posts/article/11th-house-in-astrology/)**"
} 

  const defaultSuggestions = [ 
    // {label: "case", type: "text", apply:'case: '},      
    // {label: "options", type: "keyword", apply:'options: '},       
    // {label: "content", type: "keyword", apply:'content: '},  

  ]; 

  const [ data, setData ] = useState('')
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [anchorSuggestions,setAnchorSuggestions] = useState();
  const [dataObject, setDataObject] = useState([]);

  useEffect(() => {
    // let value = parser.load(data);
    // let value = parser.loadAll(templateData)[0];
    let context_suggestions = [contextSuggestion].flatMap(obj => getKeys(obj,'text','context'));
    let generic_suggestions = [genericSuggestion].flatMap(obj => getKeys(obj,'text','generic'));

    // console.log({...context_suggestions});
    setSuggestions(prev => [...prev,...context_suggestions,...generic_suggestions]);
    
    // setDataObject(value); 


    ///////
    // console.log(yaml.parseDocument(data));
    // console.log(yaml.stringify(yaml.parseDocument(data)));


    // split first array
    let document = yaml.parseDocument(templateData);
    let firstDocument = document.contents.items[0];
    let firstDocumentString = yaml.stringify([firstDocument]);
    // console.log(firstDocumentString);
    setDataObject(firstDocumentString);

    // addNewReference(firstDocumentString);

    // split except first array
    let exceptfirstDocument = document.contents.items.slice(1);
    let exceptfirstDocumentString = yaml.stringify(exceptfirstDocument);
    setData(exceptfirstDocumentString);


  },[])

  useEffect(()=>{
    const regex = new RegExp(/&\w*-\w*/,'g');
    let newData = data.match(regex);
    if(newData !=null){
      const _anchorSuggestions = [];
      newData.forEach(anchor=>{
         anchor = anchor.substring(1);
        _anchorSuggestions.push({label: anchor, type: 'text', apply: anchor, detail: 'anchor'});
      })
      setAnchorSuggestions(_anchorSuggestions);
    }
  },[data])

  const addNewReference = () => {
    let value = parser.loadAll(dataObject)[0];    
    let references = value[0];

    references['references'].push({
      name: 'new_item',
      content: [
         {
          ext_link: {
            code: 'new_item',
            source: 'ext_link'
          }
        }
      ]
    });
    references = yaml.stringify([references]);
    setDataObject(references);
  }

  const previewYaml = () => {
    let mergedYaml = dataObject + '\n' + data;
    setData(mergedYaml);
  }

  return (
    <div className="App">
        <div style={{position:'relative'}} >
        <div style={{position:'sticky', top:'0px',zIndex:'1',backgroundColor:'#fff'}}>
            <span>References</span> &nbsp;
            <button onClick={addNewReference}>Add New Reference</button>
            {/* <YamlEditor data={ 
              (data.length > 0 && dataObject?.length > 0 ) ? parser.dump([dataObject[1]]): ''
              } onChange={setData} previewYaml={previewYaml} readOnly={true} /> */}

          <YamlEditor 
            data={ dataObject?.length > 0 ? dataObject : '' } 
            onChange={setDataObject} previewYaml={previewYaml} suggestions={suggestions} readOnly={true} 
          />
          <span>Templates</span>
        </div>
          <YamlEditor 
            data={data.length > 0 ? data : ''} 
            onChange={setData} 
            previewYaml={previewYaml} 
            suggestions={suggestions} 
            anchorSuggestions = {anchorSuggestions}
            />
        </div>
    </div>
  );
}
