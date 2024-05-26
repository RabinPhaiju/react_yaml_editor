import React,{useCallback, useRef, useState,useEffect} from "react";
import { linter, lintGutter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";
import * as yamlMode from "@codemirror/legacy-modes/mode/yaml";
import { StreamLanguage} from "@codemirror/language";
import parser from "js-yaml";
import "./codeMirror.css";
import {EditorState} from "@codemirror/state"
import {keymap,EditorView,Decoration,ViewPlugin} from "@codemirror/view";
import foldOnIndent from "./foldIndent";
import {autocompletion} from "@codemirror/autocomplete";
import plur from 'plur';
import myCompletions from "./utils/myCompletions";
import createSuggestionList from "./utils/suggestionList";
import {planets,createPlanetsRegex,getTimeLineRegex, certainMonths} from "./utils/utils";
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
}) {
  const [yamlError,setYamlError] = useState(null);
  const editorRef = useRef(null);
  const [buttons,setButtons] = useState([]);
  const refButtons = useRef([]);

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
        refButtons.current = [];
      }
    };

    if (editor) {
      editor.addEventListener('click', handleAction);
      editor.addEventListener('keydown', handleAction);
      return () => {
        editor.removeEventListener('click', handleAction);
        editor.removeEventListener('keydown', handleAction);
      };
    }
  }, [editorRef.current,buttons]);

  const _onChange = useCallback((value, viewUpdate) => {
      setButtons([]);
      refButtons.current = []

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

  const handleSymbolInWord = (word,start,end) => {
    if(/\W$/.test(word)){  // if any non charater is at the end
      end = end-1
    }else if(/^\W/.test(word)){ // if any non charater is at the start
      start = start+1
    }else if(word == "you're" || word == "you've"){ // custom rules
    }else if(/\w\W+\w/.test(word)){ // if any non charater is in between
      const splitted = word.split(/\W+/);
      if(splitted.length <= 2){
        const firstLength = splitted[0].length;
        const secondLength = splitted[1].length;
        if(firstLength > secondLength){
          end = start + firstLength;
        }else if(firstLength< secondLength){
          start = end -secondLength;
        }else{
          end = start + firstLength;
        }
      }else if(splitted.length == 3){
        const firstLength = splitted[0].length;
        const thirdLength = splitted[2].length;
        start = start + firstLength + 1;
        end = end - thirdLength - 1;
      }else{
        return false;
      }
    }
    return [start,end];
  }

  function makePlural(view) {
    const {state} = view;
    let [start,end,word,line,lineText] = getWordWithPos(state);

    if(/\W$/.test(word)){
      end = end-1
     }else if(/^\W/.test(word)){
      start = start+1
    }else if(/\w\W+\w/.test(word)){
      return false;
    }

    // Get word pos in doc
    const startInDoc = line.from + start;
    const endInDoc = line.from + end;
    word = lineText.slice(start, end);
    if(word.length < 2){ return false; }

    // replace the word
    const replaceWord = `{{#conditional }} {{is_self}} : ${word} | ${handlePlur(word)} {{/conditional }}`;
    view.dispatch({changes: { from: startInDoc,to: endInDoc,insert: replaceWord }})
    view.dispatch({selection: {anchor: startInDoc+replaceWord.length}, userEvent: "select",scrollIntoView: true});
    highlightCommand(view,startInDoc,startInDoc+replaceWord.length)
    return true;
  }

  function inputHasSuggestion(view) {
    const {state} = view;
    let [start,end,word,line,lineText] = getWordWithPos(state);

    // Get word pos in doc
    const startInDoc = line.from + start;
    const endInDoc = line.from + end;
    word = lineText.slice(start, end);
    if(word.length == 0){ return false; }

    // replace the word
    const replaceWord = `{{#has_suggestion }}`;
    view.dispatch({changes: { from: startInDoc,to: endInDoc,insert: replaceWord }})
    view.dispatch({selection: {anchor: startInDoc+replaceWord.length}, userEvent: "select",scrollIntoView: true})
    return true;
  }

  const handlePlur = (word) => {
    if(word == 'do'){
      return 'does';
    }else{
      return plur(word);
    }
  }

  const makeAltActon = (index,buttons) => (view) => {
    let currentButtons = buttons ?? refButtons.current;
    if(index > currentButtons.length){ return false; }
    const button = currentButtons[index-1];
    let start = button.start;
    let end = button.end;
    let apply = button.apply;

    view.dispatch({changes: { from: start,to: end,insert: `${apply}` }})
    view.dispatch({selection: {anchor: start+apply.length}, userEvent: "select",scrollIntoView: true})
    highlightCommand(view,start,start+apply.length);
  }

  const markDecoration = Decoration.mark({ class: 'my-mark' });
  const addMarks = ViewPlugin.fromClass(class {
    constructor(view) { this.decorations = Decoration.none;}

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view) {
      let decorations = [];
      return Decoration.set(decorations);
    }

    addHighlight(from, to) {
      this.decorations = this.decorations.update({
        add: [markDecoration.range(from, to)]
      });
    }
  }, {
    decorations: v => v.decorations
  });

  const highlightCommand = (view,from,to) => {
    const plugin = view.plugin(addMarks);
    if (plugin) {
      plugin.addHighlight(from, to);
    }
    return true;
  };

  const myKeymaps = [
    { key: 'Ctrl-m', run: moveToLine },    
    { key: 'Ctrl-Shift-q', run: makePlural },
    { key: 'Ctrl-Shift-h', run: inputHasSuggestion },
    { key: 'Ctrl-Shift-c', run: makeAltActon(1) },
    { key: 'Ctrl-Shift-1', run: makeAltActon(1) },
    { key: 'Ctrl-Shift-2', run: makeAltActon(2) },
    { key: 'Ctrl-Shift-3', run: makeAltActon(3) },
    { key: 'Ctrl-Shift-4', run: makeAltActon(4) },
    { key: 'Ctrl-Shift-5', run: makeAltActon(5) },
    { key: 'Ctrl-Shift-6', run: makeAltActon(6) },
    { key: 'Ctrl-Shift-7', run: makeAltActon(7) },
    { key: 'Ctrl-Shift-8', run: makeAltActon(8) },
    { key: 'Ctrl-Shift-9', run: makeAltActon(9) },
  ];

  const [extensions] = useState([
    yaml,
    lintGutter(),
    yamlLinter,
    // EditorState.readOnly.of(readOnly),
    EditorView.lineWrapping,
    // EditorState.allowMultipleSelections.of(true),
    // keymap.of(defaultKeymap),
    addMarks,
    foldOnIndent(),
    keymap.of(myKeymaps),
    autocompletion({ override: [
      (context) => myCompletions(context,contextSuggestions,anchorSuggestions,linkSuggestions,partialSuggestions)
      // completeFromList(
      //   ['.apple','.ball','{suggestions']
      //   )
    ],}),
  ])

  const hanleKeyPress = (event) => {
    if ((event.ctrlKey) && (event.key === 's' || event.key === 'S')) {
      event.preventDefault();
      saveYaml(event);  
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === '[' ) {}
  };

  const createSuggestionButton = (word,startInDoc,endInDoc) => {
    const buttons = createSuggestionList(word,startInDoc,endInDoc);
    if(buttons.length > 0){
      setButtons(buttons);
      refButtons.current = buttons
    }else{
        setButtons([]);
        refButtons.current = [];
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
      const start_end = handleSymbolInWord(word,start,end);
      if(start_end){
        start = start_end[0];
        end = start_end[1];
      }else {
        setButtons([]);
        refButtons.current = [];
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
      const start_end = handleSymbolInWord(word,start,end);
      if(start_end){
        start = start_end[0];
        end = start_end[1];
      }else {
        setButtons([]);
        refButtons.current = [];
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
    }else if(target == 'have'){
      regex = /\bhave\b/g;
      value = '{{has_have}}';
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

  const findRegex = (target) => {
    const view = editorRef.current?.view;
    let regex = '';
    if(target == 'timeline'){
      regex = getTimeLineRegex
    }else if(target == 'planet'){
      regex = createPlanetsRegex(planets);
    }else { return; }
    setButtons([]);
    refButtons.current = [];

    if(view){
      let matches = [...data.matchAll(regex)];
      if(matches.length == 0 && target == 'timeline'){
          matches = [...data.matchAll(certainMonths)];
       }
      const firstMatch = matches[0];
      if(firstMatch){
        const start = firstMatch.index;
        const end = firstMatch.index + firstMatch[0].length;
        view.dispatch({selection: {anchor: start}, userEvent: "select",scrollIntoView: true})
        createSuggestionButton(target,start,end);
      }
    }
  }

  const handleSuggestionButtonClick = (button) => {
    const view = editorRef.current?.view;
    if (view) {
      let start = button.start;
      let end = button.end;
      let apply = button.apply;
      view.dispatch({changes: { from: start,to: end,insert: `${apply}` }});
      highlightCommand(view,start,start+apply.length)
    }
  }

  const handlePaste = (event) => {
    // console.log(event.clipboardData.getData('Text'));
  }

  return (
    <div className="code_mirror">
      <div className="actions">
        <div className="buttons">
          <button className="button-19" onClick={() => findAndReplace('your')}>Your-Their</button>
          <button className="button-19" onClick={() => findAndReplace('yourself')}>YourSelf-ThemSelf</button>
          <button className="button-19" onClick={() => findAndReplace('have')}>Has-Have</button>
          <button className="button-19" onClick={() => findRegex('timeline')}>TimeLine</button>
          <button className="button-19" onClick={() => findRegex('planet')}>Planet</button>
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
        onChange={_onChange}
        value={data}
        extensions={extensions}
        onKeyDown={hanleKeyPress}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
      />
    </div>
  );
}
