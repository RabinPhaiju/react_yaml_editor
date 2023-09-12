import { useEffect, useState } from "react";
import "./App.css";
import parser from "js-yaml";
import { YamlEditor } from "./yamlEditor";
import yaml from 'yaml';
import getKeys from "./getKeys";

export default function App() {
  const [ data, setData ] = useState(`
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
              - text: 'him'
`
  );

  const [suggestions, setSuggestions] = useState([]);
  const [dataObject, setDataObject] = useState([]);

  useEffect(() => {
    // let value = parser.load(data);
    let value = parser.loadAll(data)[0];
    let _suggestions = value.flatMap(obj => getKeys(obj));
    setSuggestions(_suggestions);
    
    // setDataObject(value); 


    ///////
    // console.log(yaml.parseDocument(data));
    // console.log(yaml.stringify(yaml.parseDocument(data)));


    // split first array
    let document = yaml.parseDocument(data);
    let firstDocument = document.contents.items[0];
    let firstDocumentString = yaml.stringify([firstDocument]);
    // console.log(firstDocumentString);
    setDataObject(firstDocumentString);

    // split except first array
    let exceptfirstDocument = document.contents.items.slice(1);
    let exceptfirstDocumentString = yaml.stringify(exceptfirstDocument);
    setData(exceptfirstDocumentString);


  },[])

  const previewYaml = () => {
    console.log(data);
  }

  return (
    <div className="App">
        <div style={{position:'relative'}} >
        <div style={{position:'sticky', top:'0px',zIndex:'1',backgroundColor:'#fff'}}>
            <span>References Readonly</span>
            {/* <YamlEditor data={ 
              (data.length > 0 && dataObject?.length > 0 ) ? parser.dump([dataObject[1]]): ''
              } onChange={setData} previewYaml={previewYaml} readOnly={true} /> */}

          <YamlEditor 
          data={ dataObject?.length > 0 ? dataObject : '' } 
          onChange={()=>{}} previewYaml={previewYaml} suggestions={suggestions} />
          <span>Templates</span>
        </div>
          <YamlEditor data={data} onChange={setData} previewYaml={previewYaml} suggestions={suggestions} />
        </div>
    </div>
  );
}
