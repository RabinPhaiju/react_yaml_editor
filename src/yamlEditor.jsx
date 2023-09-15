import React,{useRef,useEffect,createRef, useState} from "react";
import { linter, lintGutter } from "@codemirror/lint";
import CodeMirror,{useCodeMirror} from "@uiw/react-codemirror";
// import * as events from '@uiw/codemirror-extensions-events';
import * as yamlMode from "@codemirror/legacy-modes/mode/yaml";
import { StreamLanguage} from "@codemirror/language";
import parser from "js-yaml";
import { githubLight,githubDark } from "@uiw/codemirror-theme-github";
import "./codeMirror.css";
import {EditorState} from "@codemirror/state"
// import { EditorView } from "@codemirror/view";
import {keymap } from "@codemirror/view";
import {defaultKeymap} from "@codemirror/commands"
import foldOnIndent from "./foldIndent";
import {autocompletion,completeFromList} from "@codemirror/autocomplete";
import isBracketsBalanced from "./checkBracketsBalanced";

const yaml = StreamLanguage.define(yamlMode.yaml);

const yamlLinter = linter((view) => {
  const diagnostics = [];

  try {
    parser.load(view.state.doc);
  } catch (e) {
    const loc = e.mark;
    const from = loc ? loc.position : 0;
    const to = from;
    const severity = "error";

    diagnostics.push({
      from,
      to,
      message: e.message,
      severity
    });
  }

  return diagnostics;
});

export function YamlEditor({
  data,
  onChange,
  previewYaml,
  suggestions,
  anchorSuggestions=[],
  readOnly=false
}) {
  const [yamlError,setYamlError] = useState(null);
  const editorRef = createRef();
  const valueRef = useRef(data);

  function _onChange(value) {
      // let value_object = parser.load(value);
      // console.log(value_object);
      // value = parser.dump(value_object[0]);
      // console.log(value);
      try{
        parser.loadAll(value);
        onChange(value);
        setYamlError(null)
      }catch(e){
        console.log(e);
        setYamlError(e?.mark?.snippet)
      }
  }

  function checkBracketPair(context){
    let isPair = true;
    let match_before = context.matchBefore(/.*}.*/);
    if(match_before != null && match_before.text.includes('}')){
      isPair = isBracketsBalanced(match_before.text.replace(/{{(?!.*{{)/, ''));
    }
    return isPair;
  }

  function myCompletions(context) {
    let word = context.matchBefore(/\w*/);
    let bracket = context.matchBefore(/{.*/);
    let anchor = context.matchBefore(/\*.*/);
    let newLine = context.matchBefore(/\s*-\s\w*/);

    let test = context.matchBefore(/{{#\w+/);

    console.log('----------',test);

    console.log('newline',newLine);
    console.log('word',word);
    console.log('bracket',bracket);
    console.log('anchor',anchor);

    if (word.from == word.to && !context.explicit){ return null}
    if (bracket !=null && bracket.from == bracket.to && !context.explicit){ return null}
    if (anchor !=null && anchor.from == anchor.to && !context.explicit){ return null}
    let newGaps = " ".repeat(4);
    let siblingGaps = " ".repeat(2);
    if(newLine!=null){ 
      newGaps = newGaps + newLine.text.split('-')[0]; 
      siblingGaps = siblingGaps + newLine.text.split('-')[0]; 
    }

    if((( context.matchBefore(/{{\s+ \w+/) !=null || 
        context.matchBefore(/{{\w+/) !=null ||
        context.matchBefore(/{{\s+/) !=null ||
        context.matchBefore(/{{/) !=null
      ) &&  checkBracketPair(context) ) ){
        return {
        from: word.from,
        options: suggestions
      }
    }
    if(context.matchBefore(/-\s.*/) !=null && !(context.matchBefore(/:.*/) !=null) ){
      return {
        from: word.from,
        options: [
          {label: "magic", type: "text", apply: "jadu", detail: "local"},
          {label: "template", type: "keyword", apply:'template: &'},    
          {label: "text", type: "keyword", apply:'text: '},
          {label: "references", type: "keyword", apply:`references: \n${newGaps}`},
          {label: "paragraph", type: "keyword", apply:`paragraph: |\n${newGaps}`},
          {label: "switch_case", type: "keyword", apply:`switch_case: \n${newGaps}case : case\n${newGaps}options: \n${newGaps}    `},
          {label: "new_ref", type: "keyword", apply:`name: name\n${siblingGaps}content : \n${newGaps}`},
          {label: "iterator", type: "keyword", apply:`iterator: \n${newGaps}elements : \n${newGaps}loop: `},
          {label: "ext_link", type: "keyword", apply:`ext_link: \n${newGaps}code : code\n${newGaps}source: source`},
          {
            label: "action_link", 
            type: "keyword", 
            apply:`action_link: \n${newGaps}name : name\n${newGaps}auth: auth\n${newGaps}params:\n${newGaps}  param1: param\n${newGaps}  param2: param`
          },
          
        ],
      }
    }

    if(context.matchBefore(/\*.*/) !=null){ return { from: word.from,options: anchorSuggestions }}
    
    if(context.matchBefore(/{{>\w+/) !=null || context.matchBefore(/{{>/) !=null){ 
      return {from: word.from,options: [
          {label: "greater1", type: "text"},
          {label: "greater2", type: "text"},
        ],
      }}

    if(context.matchBefore(/{{#\w+/) !=null || context.matchBefore(/{{#/) !=null){ 
      return {from: word.from,options: [
          {label: "sharp1", type: "text"},
          {label: "share2", type: "text"},
        ],
      }}

      if(
        !(context.matchBefore(/:.*/) !=null) &&
        !(context.matchBefore(/{.*/) !=null) 
        ){
        return { from: word.from, options: [
            {label: "worse", type: "keyword", apply:`worse: ` , detail: "local"},
            {label: "bad", type: "keyword", apply:`bad: ` , detail: "local"},
            {label: "average", type: "keyword", apply:`average: ` , detail: "local"},
            {label: "good", type: "keyword", apply:`good: ` , detail: "local"},
            {label: "excellent", type: "keyword", apply:`excellent: ` , detail: "local"},
          ],}
      }
    
    return {
      from: word.from,
      options: [
        {label: "no match found", type: "text"},
        {label: "check suggestion rules", type: "text"},
      ],
    }
  }

  function moveToLine(view) {
    let line = prompt("Which line?")
    if (!/^\d+$/.test(line) || +line <= 0 || +line > view.state.doc.lines)
      return false
    let pos = view.state.doc.line(+line).from
    view.dispatch({selection: {anchor: pos}, userEvent: "select"})
    return true
  }

  const extensions = [
    yaml,
    lintGutter(),
    yamlLinter,
    EditorState.readOnly.of(readOnly),
    // EditorState.allowMultipleSelections.of(true),
    // keymap.of(defaultKeymap),
    keymap.of([
{ key: 'Ctrl-m', run: moveToLine },
    ]),
    autocompletion({ override: [
      myCompletions,
      // completeFromList(
      //   [
      //     '.apple',
      //     '.ball',
      //     '{suggestions'
      //   ]
      //   )
    ],}),
  ]

  if(!readOnly){
    extensions.push(foldOnIndent())
  }

  const hanleKeyPress = (event) => {
    if ((event.ctrlKey) && (event.key === 's' || event.key === 'S')) {
      event.preventDefault();
      previewYaml();  
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === '[' ) {
      
    }
  };

  // const { setContainer } = useCodeMirror({
  //   container: editorRef.current,
  //   extensions: extensions,
  //   value: data,
  //   theme: readOnly? githubDark : githubLight,
  //   height : readOnly ? '200px' : null
  // });

  // useEffect(() => {
  //   if(editorRef.current){
  //     setContainer(editorRef.current);
  //     console.log(editorRef.current);
  //     // hanleKeyPress
  //   }

  // },[editorRef.current])

  return (
    <div className="code_mirror">
      <span>{yamlError}</span>
      {/* <div ref={editorRef}/> */}
      <CodeMirror
        // ref={editorRef}
        height= {readOnly ? '200px' : null}
        onChange={_onChange}
        value={data}
        theme={ readOnly? githubDark : githubLight}
        extensions={extensions}
        // selection={EditorSelection.cursor(50)}
        
        basicSetup= {{
          lineNumbers: true,
          lineWrapping: true,
          foldGutter: true,
          foldKeymap: true,
        }}
        onKeyDown={hanleKeyPress}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
}
