import { useEffect, useState } from "react";
import useLocalStorage from "./components/useLocalStorage";
import "./App.css";
import parser from "js-yaml";
import { YamlEditor } from "./yamlEditor";
import yaml from 'yaml';
import getKeys from "./getKeys";
import {template1, template2,template3} from "./assets/template";
import {contextSuggestion, partialContextSuggestion, defaultSuggestions, externalLink} from "./assets/context";

export default function App() {
const [contextSuggestions, setContextSuggestions] = useState([]);
const [partialSuggestions, setPartialSuggestions] = useState(defaultSuggestions);
const [linkSuggestions, setLinkSuggestions] = useState([]);
const [anchorSuggestions,setAnchorSuggestions] = useState();
const [publicData, setPublicData] = useLocalStorage("public", template1)
const [privateData, setPrivateData] = useLocalStorage("private", template2)
const [data, setData] = useState(template3);
const [currentTab,setCurrentTab] = useLocalStorage("tab", "public");

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
  updateSuggestions(contextSuggestion,partialContextSuggestion,externalLink);
},[])

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

const handleCurrentTabChange = (tab)=>{
  setCurrentTab(tab);
}

  return (
    <div className="App">
        <div>
        <div className="nav">
          <button style={currentTab === "public" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => handleCurrentTabChange('public')}>Public</button>
          <button style={currentTab === "private" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => handleCurrentTabChange("private")}>Private</button>
          <button style={currentTab === "data" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => handleCurrentTabChange("data")}>Other</button>
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
