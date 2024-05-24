import React,{useCallback, useRef, useState,useEffect} from "react";
import { linter, lintGutter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";
import * as yamlMode from "@codemirror/legacy-modes/mode/yaml";
import { StreamLanguage} from "@codemirror/language";
import parser from "js-yaml";
import { githubLight,githubDark } from "@uiw/codemirror-theme-github";
import "./codeMirror.css";
import {EditorState} from "@codemirror/state"
import {keymap,EditorView } from "@codemirror/view";
import foldOnIndent from "./foldIndent";
import {autocompletion} from "@codemirror/autocomplete";
import plur from 'plur';
import myCompletions from "./utils";
// import isBracketsBalanced from "./checkBracketsBalanced";

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
  currentTab,
  onChange,
  saveYaml,
  contextSuggestions,
  partialSuggestions,
  linkSuggestions,
  anchorSuggestions=[],
  readOnly=false
}) {
  const [yamlError,setYamlError] = useState(null);
  const editorRef = useRef(null);
  const [buttons,setButtons] = useState([]);

  useEffect(() => {
    const editor = editorRef.current?.editor;

    const handleAction = (event) => {
      if(event.key == 'ArrowLeft' || event.key == 'ArrowRight') {
        checkArrowHorizontalContext();
        return;
      }else if(event?.pointerType == 'touch' || event?.pointerType == 'mouse'){
        const isAltKeyPressed = event?.altKey ?? false;
        checkMouseClickContext(isAltKeyPressed);
        return;
      }
      if(event.keyCode == 17 || event.keyCode == 16  )return;
      if(buttons.length > 0){
        setButtons([]);
      }
    };

    if (editor) {
      editor.addEventListener('dblclick', handleDoubleClick);
      editor.addEventListener('click', handleAction);
      editor.addEventListener('keydown', handleAction);
      return () => {
        editor.removeEventListener('dblclick', handleDoubleClick);
        editor.removeEventListener('click', handleAction);
        editor.removeEventListener('keydown', handleAction);
      };
    }
  }, [editorRef.current],buttons);

  const _onChange = useCallback((value, viewUpdate) => {
      setButtons([]);

      try{
        parser.loadAll(value);
        onChange(value,currentTab);
        setYamlError(null)
      }catch(e){
        setYamlError(e?.mark?.snippet)
      }
  }, [currentTab]);

  function checkBracketPair(context){
    let isPair = true;
    let match_before = context.matchBefore(/.*}.*/);
    if(match_before != null && match_before.text.includes('}')){
      isPair = isBracketsBalanced(match_before.text.replace(/{{(?!.*{{)/, ''));
    }
    return isPair;
  }

  function moveToLine(view) {
    let line = prompt("Which line?")
    if (!/^\d+$/.test(line) || +line <= 0 || +line > view.state.doc.lines)
      return false

    let currentLine = view.state.doc.line(+line)
    let text = currentLine.text
    let pos = currentLine.from
    let numberofSpacesBeforeText = text.match(/^\s*/)[0].length
    view.dispatch({selection: {anchor: pos+numberofSpacesBeforeText}, userEvent: "select",scrollIntoView: true})
    return true
  }

  const getWordWithPos = (state)=>{
    const mainWord = state.selection.main
    const pos = mainWord.from
    const line = state.doc.lineAt(pos);
    // Get the text of the line
    const lineText = line.text;
    // Get the position within the line
    const posInLine = pos - line.from;
    // Find the word boundaries
    const start = lineText.lastIndexOf(' ', posInLine - 1) + 1;
    let end = lineText.indexOf(' ', posInLine);
    if(end == -1){ end = lineText.length; }
    const word = lineText.slice(start, end);
    return [start,end,word,line,lineText]
  }

  function makePlural(view) {
    const {state} = view;
    let [start,end,word,line,lineText] = getWordWithPos(state);

    if(/\W$/.test(word)){  // if any non charater is at the end
      end = end-1
     }else if(/^\W/.test(word)){ // if any non charater is at the start
      start = start+1
    }else if(/\w\W+\w/.test(word)){ // if any non charater is in between
      return false;
    }

    // Get word pos in doc
    const startInDoc = line.from + start;
    const endInDoc = line.from + end;
    word = lineText.slice(start, end);
    if(word.length < 2){ return false; }

    // replace the word
    view.dispatch({changes: { from: startInDoc,to: endInDoc,insert: `{{#conditional }} {{is_self}} : ${word} | ${handlePlur(word)} {{/conditional }}` }})

    return true;
  }

  const handlePlur = (word) => {
    if(word == 'do'){
      return 'does';
    }else{
      return plur(word);
    }
  }

  const makeAltActon = (index,cbuttons) => (view) => {
    if(index > cbuttons.length){ return false; }
    const button = cbuttons[index-1];
    let start = button.start;
    let end = button.end;
    let apply = button.apply;

    view.dispatch({changes: { from: start,to: end,insert: `${apply}` }})
    view.dispatch({selection: {anchor: start+apply.length}, userEvent: "select",scrollIntoView: true})
  }

  const extensions = [
    yaml,
    lintGutter(),
    yamlLinter,
    EditorState.readOnly.of(readOnly),
    EditorView.lineWrapping,
    // EditorState.allowMultipleSelections.of(true),
    // keymap.of(defaultKeymap),
    keymap.of([
      { key: 'Ctrl-m', run: moveToLine },
      { key: 'Ctrl-Shift-q', run: makePlural },
      { key: 'Ctrl-Shift-c', run: makeAltActon(1,buttons) },
      { key: 'Ctrl-Shift-1', run: makeAltActon(1,buttons) },
      { key: 'Ctrl-Shift-2', run: makeAltActon(2,buttons) },
      { key: 'Ctrl-Shift-3', run: makeAltActon(3,buttons) },
      { key: 'Ctrl-Shift-4', run: makeAltActon(4,buttons) },
      { key: 'Ctrl-Shift-5', run: makeAltActon(5,buttons) },
      { key: 'Ctrl-Shift-6', run: makeAltActon(6,buttons) },
      { key: 'Ctrl-Shift-7', run: makeAltActon(7,buttons) },
      { key: 'Ctrl-Shift-8', run: makeAltActon(8,buttons) },
      { key: 'Ctrl-Shift-9', run: makeAltActon(9,buttons) },
    ]),
    autocompletion({ override: [
      (context) => myCompletions(context,contextSuggestions,anchorSuggestions,linkSuggestions,partialSuggestions)
      // completeFromList(
      //   ['.apple','.ball','{suggestions']
      //   )
    ],}),
  ]

  if(!readOnly){
    extensions.push(foldOnIndent())
  }

  const hanleKeyPress = (event) => {
    if ((event.ctrlKey) && (event.key === 's' || event.key === 'S')) {
      event.preventDefault();
      saveYaml(event);  
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === '[' ) {}
  };

  const handleDoubleClick = (event) => {
    const view = editorRef.current?.view;
    if (view) {
      const { state } = view;
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos !== null) {
        const line = state.doc.lineAt(pos);
        // Get the text of the line
        const lineText = line.text;
        // Get the position within the line
        const posInLine = pos - line.from;
        // Find the word boundaries
        let start = lineText.lastIndexOf(' ', posInLine - 1) + 1;
        let end = lineText.indexOf(' ', posInLine);
        if(end == -1){ end = lineText.length; }
        // Get word pos in doc
        let word = lineText.slice(start, end);

        if(/\W$/.test(word)){  // if any non charater is at the end
          end = end-1
         }else if(/^\W/.test(word)){ // if any non charater is at the start
          start = start+1
        }
        word = lineText.slice(start, end);

        const startInDoc = line.from + start;
        const endInDoc = line.from + end;
        createSuggestionButton(word,startInDoc,endInDoc);
      }
    }
  };

  const createSuggestionList = (word,startInDoc,endInDoc) => {
    let buttons = []
    if(word == 'you' || word == 'You'){
      buttons = [
        { start:startInDoc,end: endInDoc,
          label: 'them',apply:'{{them}}',
        },
        { start:startInDoc,end: endInDoc,
          label: 'they',apply:'{{they}}',
        }
      ];
    }else if(word == 'is' || word == 'are'){
      buttons = [
        { start:startInDoc,end: endInDoc,
          label: 'is_are',apply:'{{is_are}}',
        }
      ];
    }else if(word == 'Your' || word == 'your'){
      buttons = [
        { start:startInDoc,end:endInDoc,
          label: "native's",apply:"{{native's}}",
        },
        { start:startInDoc,end:endInDoc,
          label: "their",apply:"{{their}}",
        }
      ];

    }else{
        
    }
    return buttons;
  }

  const createSuggestionButton = (word,startInDoc,endInDoc) => {
    const buttons = createSuggestionList(word,startInDoc,endInDoc);
    if(buttons.length > 0){
      setButtons(buttons);
    }else{
        setButtons([]);
    }
  }
  const applySuggestionsWithAlt = (word,startInDoc,endInDoc,view) => {
    const buttons = createSuggestionList(word,startInDoc,endInDoc);
    if(buttons.length > 0){
      makeAltActon(1,buttons)(view);
    }
  }

  const checkArrowHorizontalContext = () => {
    const view = editorRef.current?.view;
    if (view) {
      const {state} = view;
      let [start,end,word,line,lineText] = getWordWithPos(state);
  
      if(/\W$/.test(word)){  // if any non charater is at the end
        end = end-1
       }else if(/^\W/.test(word)){ // if any non charater is at the start
        start = start+1
      }else if(/\w\W+\w/.test(word)){ // if any non charater is in between
        return false;
      }
  
      // Get word pos in doc
      const startInDoc = line.from + start;
      const endInDoc = line.from + end;
      word = lineText.slice(start, end);

      createSuggestionButton(word,startInDoc,endInDoc);
      return true;
    }
  };

  const checkMouseClickContext = (withAlt) => {
    const view = editorRef.current?.view;
    if (view) {
      const {state} = view;
      let [start,end,word,line,lineText] = getWordWithPos(state);
  
      if(/\W$/.test(word)){  // if any non charater is at the end
        end = end-1
       }else if(/^\W/.test(word)){ // if any non charater is at the start
        start = start+1
      }else if(/\w\W+\w/.test(word)){ // if any non charater is in between
        return false;
      }
  
      // Get word pos in doc
      const startInDoc = line.from + start;
      const endInDoc = line.from + end;
      word = lineText.slice(start, end);

      if(withAlt){
        applySuggestionsWithAlt(word,startInDoc,endInDoc,view);
      }else{
        createSuggestionButton(word,startInDoc,endInDoc);
      }
      return true;
    }
  };

  const findAndReplace = (target) => {
    const view = editorRef.current?.view;
    let regex = ''
    let value = ''
    if(target == 'your'){
      regex = /\b[Yy]our(?!self\b)/g;
      value = '{{their}}';
    }else if(target == 'yourself'){
      regex = /\b[Yy]ourself\b/g;
      value = '{{themself}}';
    }else{ return;}
    if(view){
      const matches = [...data.matchAll(regex)].reverse();
      matches.forEach((match) => {
        const start = match.index;
        const end = match.index + match[0].length;
        view.dispatch({changes: { from: start,to: end,insert: value }})
      });
    }
  }

  const handleSuggestionButtonClick = (button) => {
    const view = editorRef.current?.view;
    if (view) {
      let start = button.start;
      let end = button.end;
      let apply = button.apply;
      view.dispatch({changes: { from: start,to: end,insert: `${apply}` }})
    }
  }

  return (
    <div className="code_mirror">
      <div className="actions">
        <div className="buttons">
          <button className="button-19" onClick={() => findAndReplace('your')}>Your-Their</button>
          <button className="button-19" onClick={() => findAndReplace('yourself')}>YourSelf-ThemSelf</button>
          {
            buttons?.map((button,index)=>{
              return (<button key={index} className="button-85" onClick={() => handleSuggestionButtonClick(button)} >{index+1}-{button.label}</button>)
            })
          }
        </div>

      </div>
      <span>{yamlError}</span>
      <CodeMirror
        ref={editorRef}
        height= {readOnly ? '200px' : null}
        onChange={_onChange}
        value={data}
        theme={ readOnly? githubDark : githubLight}
        extensions={extensions}
        onKeyDown={hanleKeyPress}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
}
