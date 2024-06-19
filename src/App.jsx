import { useEffect, useState } from "react";
import useLocalStorage from "./components/useLocalStorage";
import "./App.css";
import { YamlEditor } from "./yamlEditor";
import getKeys from "./getKeys";
import debounce from "./utils/debounce"
import {template1, template2,template3} from "./assets/template";
import {contextSuggestion, partialContextSuggestion, defaultSuggestions, externalLink} from "./assets/context";

export default function App() {
const [contextSuggestions, setContextSuggestions] = useState([]);
const [partialSuggestions, setPartialSuggestions] = useState(defaultSuggestions);
const [linkSuggestions, setLinkSuggestions] = useState([]);
const [anchorSuggestions,setAnchorSuggestions] = useState();
const [publicData, setPublicData] = useLocalStorage("public", template1)
const [privateData, setPrivateData] = useLocalStorage("private", template2)
const [data, setData] = useLocalStorage("data",template3);
const [currentTab,setCurrentTab] = useLocalStorage("tab", "public");
const [toogleWordCount,setToogleWordCount] = useLocalStorage("word-count", false);
const defaultWordCount = {"you":0,"he":0,"his":0,"him":0,"friend":0,"husband":0,"wife":0,"son":0,"man": 0}
const [wordCount,setWordCount] = useState(defaultWordCount)
const [wordCountToogle,setWordCountToogle] = useLocalStorage("word-count-toogle", false);
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

const handleToogleWordCount = () =>{
  setToogleWordCount(!toogleWordCount);
}

useEffect(()=>{
  updateSuggestions(contextSuggestion,partialContextSuggestion,externalLink);
},[])

useEffect(()=>{
  setWordCount(defaultWordCount);
},[currentTab])

useEffect(()=>{
  const regex = new RegExp(/&\w+?\w+/,'g');
  const currentData = currentTab == "public" 
    ? publicData 
    : currentTab == "private" 
      ? privateData 
      : data;
  let newData = currentData?.match(regex);
  if(newData !=null && newData.length > 0){
    const _anchorSuggestions = [];
    newData.forEach(anchor=>{
       anchor = anchor.substring(1);
      _anchorSuggestions.push({label: anchor, type: 'text', apply: anchor, detail: 'anchor'});
    })
    setAnchorSuggestions(_anchorSuggestions);
  }

  // update word count
  const wordCountDebounce = debounce(updateWordCount, 568);
  if(wordCountToogle){
    wordCountDebounce(currentData);
  }
},[data,publicData,privateData,wordCountToogle])

const changeYamlData = (value,cTab) => {
  if(cTab === "public"){
    setPublicData(value );
  }else if(cTab === "private"){
    setPrivateData(value );
  }else{
    setData(value );
  }
}

const handleCheckCount = () => {
  let value = currentTab === "public" 
  ? publicData ?? ''
  : currentTab === "private" 
    ? privateData ?? ''
    : data.length > 0 
      ? data 
      : '';

  updateWordCount(value);
}

const updateWordCount = (value) => {
  const words = value.split(/([-:_'’., \n]| is |\bshe \| he\b|\bher \| his\b|\her \| him\b|s*friend\b|\bgirlfriend \| boyfriend\b|\bdaughter \| son\b|\bwife \| husband\b|\bwoman \| man\b)/);
  let _wordCount = {...defaultWordCount};
  words.forEach((word)=>{
    if(Object.keys(_wordCount).includes(word.toLowerCase())){
      _wordCount[word.toLowerCase()] += 1;
    }
  })  
  setWordCount(_wordCount);
}

const saveYaml = (value) => {
    updateWordCount(value);
}

const handleCurrentTabChange = (tab)=>{
  setCurrentTab(tab);
}

  return (
    <div className="App">
        <div className="nav">
            <div className="actions">
              <div>
                <button style={currentTab === "public" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => handleCurrentTabChange('public')}>Public</button>
                <button style={currentTab === "private" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => handleCurrentTabChange("private")}>Private</button>
                <button style={currentTab === "data" ? {backgroundColor:'teal'}:{}} className="button-85" onClick={() => handleCurrentTabChange("data")}>Other</button>
              </div>
              <button className="toogle-word-count" onClick={handleToogleWordCount}>Word Count</button>
            </div>
        </div>

        <div className="content">
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
            {
              toogleWordCount && (
                <div className="word-count">
                <button className="button-19" onClick={handleCheckCount}>Check Count</button>
                {
                  wordCount && Object.keys(wordCount).map((key)=>{
                    return <p key={key}>{wordCount[key]} : {key}</p>
                  })
                }
                 <div className="toggle-container">
                  <input type="checkbox" checked={wordCountToogle ? 'checked' : ''} onChange={()=>setWordCountToogle(!wordCountToogle)} className="toggle-input"/>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 292 142" className="toggle">
                    <path d="M71 142C31.7878 142 0 110.212 0 71C0 31.7878 31.7878 0 71 0C110.212 0 119 30 146 30C173 30 182 0 221 0C260 0 292 31.7878 292 71C292 110.212 260.212 142 221 142C181.788 142 173 112 146 112C119 112 110.212 142 71 142Z" className="toggle-background"></path>
                    <rect rx="6" height="64" width="12" y="39" x="64" className="toggle-icon on"></rect>
                    <path d="M221 91C232.046 91 241 82.0457 241 71C241 59.9543 232.046 51 221 51C209.954 51 201 59.9543 201 71C201 82.0457 209.954 91 221 91ZM221 103C238.673 103 253 88.6731 253 71C253 53.3269 238.673 39 221 39C203.327 39 189 53.3269 189 71C189 88.6731 203.327 103 221 103Z" fillRule="evenodd" className="toggle-icon off"></path>
                    <g filter="url('#goo')">
                      <rect fill="#fff" rx="29" height="58" width="116" y="42" x="13" className="toggle-circle-center"></rect>
                      <rect fill="#fff" rx="58" height="114" width="114" y="14" x="14" className="toggle-circle left"></rect>
                      <rect fill="#fff" rx="58" height="114" width="114" y="14" x="164" className="toggle-circle right"></rect>
                    </g>
                    <filter id="goo">
                      <feGaussianBlur stdDeviation="10" result="blur" in="SourceGraphic"></feGaussianBlur>
                      <feColorMatrix result="goo" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" mode="matrix" in="blur"></feColorMatrix>
                    </filter>
                  </svg>
                </div>
            </div>
              )
            }
        </div>
    </div>
  );
}
