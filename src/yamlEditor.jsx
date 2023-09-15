import React,{useRef,useEffect,createRef} from "react";
import { linter, lintGutter } from "@codemirror/lint";
import CodeMirror,{useCodeMirror} from "@uiw/react-codemirror";
// import * as events from '@uiw/codemirror-extensions-events';
import * as yamlMode from "@codemirror/legacy-modes/mode/yaml";
import { StreamLanguage } from "@codemirror/language";
import parser from "js-yaml";
import { githubLight,githubDark } from "@uiw/codemirror-theme-github";
import "./codeMirror.css";
import {EditorState,EditorSelection} from "@codemirror/state";
// import { EditorView } from "@codemirror/view";
import {keymap,EditorView } from "@codemirror/view";
import {defaultKeymap} from "@codemirror/commands"
import foldOnIndent from "./foldIndent";
import {syntaxTree} from "@codemirror/language";
import {autocompletion,completeFromList,} from "@codemirror/autocomplete";
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

export function YamlEditor({data,onChange,previewYaml,suggestions,readOnly=false}) {
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
      }catch(e){
        console.log(e);
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

    console.log('word',word);
    console.log('bracket',bracket);

    if (word.from == word.to && !context.explicit){ return null}
    if (bracket !=null && bracket.from == bracket.to && !context.explicit){ return null}

    if(
        // context.matchBefore(/:.*/) || 
        // context.matchBefore(/.*:/) ||
        ( 
          ( context.matchBefore(/{{\s+ \w+/) !=null || 
            context.matchBefore(/{{\w+/) !=null ||
            context.matchBefore(/{{\s+/) !=null ||
            context.matchBefore(/{{/) !=null
          ) && 
            checkBracketPair(context) 
            )
        ){
        return {
        from: word.from,
        options: suggestions
      }
    }
    if(context.matchBefore(/- .*/) !=null && !(context.matchBefore(/:.*/) !=null) ){
      return {
        from: word.from,
        options: [
          {label: "match", type: "text"},
          {label: "magic", type: "text", apply: "jadu", detail: "local"},
          {label: "template", type: "keyword", apply:'template: '},      
          {label: "paragraph", type: "keyword", apply:'paragraph: '},       
          {label: "switch_case", type: "keyword", apply:'switch_case: \n    case : \n    options:'},
          {label: "text", type: "keyword", apply:'text: \n    '},  
        ],
      }
    }
    return {
      from: word.from,
      options: [
        {label: "no match found", type: "text"},
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
    keymap.of([{ key: 'CTRL-l', run: moveToLine },]),
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
  //   container: editor.current,
  //   extensions: extensions,
  //   value: data,
  // });

  // useEffect(() => {
  //   if(editor.current){
  //     setContainer(editor.current);
  //   }

  // },[editor.current])

  return (
    <div className="code_mirror">
      {/* <div ref={editor}/> */}
      <CodeMirror
        ref={editorRef}
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
