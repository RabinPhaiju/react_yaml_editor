import { useEffect, useState } from "react";
import useLocalStorage from "./components/useLocalStorage";
import "./App.css";
import { YamlEditor } from "./yamlEditor";
import getKeys from "./getKeys";
// import debounce from "./utils/debounce"
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
const defaultWordCount = {"you":0,"he":0,"his":0,"him":0,"friend":0,"husband":0,"wife":0,"is":0}
const [wordCount,setWordCount] = useState(defaultWordCount)
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
},[data,publicData,privateData])

const changeYamlData = (value,cTab) => {
  if(cTab === "public"){
    setPublicData(value );
  }else if(cTab === "private"){
    setPrivateData(value );
  }else{
    setData(value );
  }
      // update word count
      // const wordCountDebounce = debounce(updateWordCount, 568);
      // wordCountDebounce(value);
}

const updateWordCount = (value) => {
  const words = value.split(/([-:_' ]| is |\bshe \| he\b|\bher \| his\b|\her \| him\b|s*friend|\bgirlfriend \| boyfriend\b|\bwife \| husband\b)/);
  let _wordCount = {...defaultWordCount};
  words.forEach((word)=>{
    if(Object.keys(_wordCount).includes(word)){
      _wordCount[word] += 1;
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
                <button className="button-19" onClick={() => updateWordCount(data)}>Check Count</button>
                {
                  wordCount && Object.keys(wordCount).map((key)=>{
                    return <p key={key}>{wordCount[key]} : {key}</p>
                  })
                }
            </div>
              )
            }
        </div>
    </div>
  );
}
