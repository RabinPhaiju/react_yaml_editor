import React,{useCallback, useState} from "react";
import { linter, lintGutter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";
import * as yamlMode from "@codemirror/legacy-modes/mode/yaml";
import { StreamLanguage} from "@codemirror/language";
import parser from "js-yaml";
import { githubLight,githubDark } from "@uiw/codemirror-theme-github";
// import "./style.css";
import {EditorState} from "@codemirror/state"
import {keymap,EditorView } from "@codemirror/view";
import foldOnIndent from "./foldIndent";
import {autocompletion} from "@codemirror/autocomplete";
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
  saveYaml,
  contextSuggestions,
  partialSuggestions,
  linkSuggestions,
  anchorSuggestions=[],
  readOnly=false
}) {
  const [yamlError,setYamlError] = useState(null);
  // const editorRef = createRef();
  // const valueRef = useRef(data);

  const _onChange = useCallback((value, viewUpdate) => {
      // let value_object = parser.load(value);
      // console.log(value_object);
      // value = parser.dump(value_object[0]);
      try{
        parser.loadAll(value);
        onChange(value);
        setYamlError(null)
      }catch(e){
        // console.log(e);
        setYamlError(e?.mark?.snippet)
      }
  }, []);

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
    let bracketPartials = context.matchBefore(/{>.*/);
    let anchor = context.matchBefore(/\*.*/);
    let newLine = context.matchBefore(/\s*-\s\w*/);

    // let test = context.matchBefore(/{{#\w+/);

    // console.log('----------',test);

    // console.log('newline',newLine);
    // console.log('word',word);
    // console.log('bracket',bracket);
    // console.log('anchor',anchor);

    if (word.from == word.to && !context.explicit){ return null}
    if (bracket !=null && bracket.from == bracket.to && !context.explicit){ return null}
    if (bracketPartials !=null && bracketPartials.from == bracketPartials.to && !context.explicit){ return null}
    if (anchor !=null && anchor.from == anchor.to && !context.explicit){ return null}
    let newGaps = " ".repeat(4);
    let siblingGaps = " ".repeat(2);
    if(newLine!=null){ 
      newGaps = newGaps + newLine.text.split('-')[0]; 
      siblingGaps = siblingGaps + newLine.text.split('-')[0]; 
    }

    if( 
        (context.matchBefore(/{{\s+\w+/) !=null || 
        context.matchBefore(/{{\w+/) !=null ||
        context.matchBefore(/{{ /) !=null ||
        context.matchBefore(/{{\s+/) !=null ||
        context.matchBefore(/{{/) !=null) &&
        !(
          context.matchBefore(/{{{\s+\w+/) !=null || 
          context.matchBefore(/{{{\w+/) !=null ||
          context.matchBefore(/{{{ /) !=null ||
          context.matchBefore(/{{{\s+/) !=null ||
          context.matchBefore(/{{{/) !=null
        )
       ){
        return {
          from: word.from,
          options: contextSuggestions
      }
    }

    if((context.matchBefore(/-\s\w+/) !=null || context.matchBefore(/-\s/) !=null) && !(context.matchBefore(/:.*/) !=null) ){
      return {
        from: word.from,
        options: [
          {label: "text", type: "keyword", apply:'text: '},
          {label: "paragraph", type: "keyword", apply:`paragraph: |\n${newGaps}`},
          {label: "choice", type: "keyword", apply:`choice: `},
          {label: "switch_case", type: "keyword", apply:`switch_case: \n${newGaps}case : case\n${newGaps}options: \n${newGaps}    `},
          {label: "iterator", type: "keyword", apply:`iterator: \n${newGaps}elements : \n${newGaps}loop: `},
          {label: "references", type: "keyword", apply:`references: \n${newGaps}`},
          {label: "template", type: "keyword", apply:'template: &'},    
          {label: "new_ref", type: "keyword", apply:`name: name\n${siblingGaps}content : \n${newGaps}`},
          {label: "ext_link", type: "keyword", apply:`ext_link: \n${newGaps}code : code\n${newGaps}source: source`},
          {
            label: "action_link", 
            type: "keyword", 
            apply:`action_link: \n${newGaps}name : name\n${newGaps}auth: auth\n${newGaps}params:\n${newGaps}  param1: param\n${newGaps}  param2: param`
          }, 
          {
            label: "app_link", 
            type: "keyword", 
            apply:`app_link: \n${newGaps}path : path\n${newGaps}params: \n${newGaps}  page: page\n${newGaps}  tab: tab`
          },
          
        ],
      }
    }

    if(
    context.matchBefore(/\*\w+/) !=null && context.matchBefore(/\*\*\w+/) ==null
    ){ 
      return { from: word.from,options: anchorSuggestions }
    }
    
    if(
        (context.matchBefore(/{{>\s+\w+/) !=null || 
        context.matchBefore(/{{>\w+/) !=null ||
        context.matchBefore(/{{> /) !=null ||
        context.matchBefore(/{{>\s+/) !=null ||
        context.matchBefore(/{{>/) !=null) &&
        !(
          context.matchBefore(/{{{>\s+\w+/) !=null || 
          context.matchBefore(/{{{>\w+/) !=null ||
          context.matchBefore(/{{{> /) !=null ||
          context.matchBefore(/{{{>\s+/) !=null ||
          context.matchBefore(/{{{>/) !=null
        )
      ){ 
      return {
        from: word.from,
        options: partialSuggestions,
      }
    }

    if(
        context.matchBefore(/{{#ext_link}}\s+\w+/) !=null || 
        context.matchBefore(/{{#ext_link}}\w+/) !=null ||
        context.matchBefore(/{{#ext_link}} /) !=null ||
        context.matchBefore(/{{#ext_link}}\s+/) !=null ||
        context.matchBefore(/{{#ext_link}}/) !=null
    ){ 
      return {
        from: word.from,
        options: linkSuggestions
        }
      }
    
    return {
      from: word.from,
      options: [
        {label: "conditional", type: "text",apply:'{{#conditional}}  :  |  {{/conditional}}', detail: "expression"},
        {label: "gender_conditional", type: "text",apply:'{{#conditional}} {{is_gender_male}}  :  |  {{/conditional}}', detail: "expression"},
        {label: "he_she_conditional", type: "text",apply:'{{#conditional}} {{is_gender_male}}  : she | he {{/conditional}}', detail: "expression"},
        {label: "husband_wife_conditional", type: "text",apply:'{{#conditional}} {{is_gender_male}}  : wife | husband {{/conditional}}', detail: "expression"},
        {label: "boy_girl_conditional", type: "text",apply:'{{#conditional}} {{is_gender_male}}  : girlfriend | boyfriend {{/conditional}}', detail: "expression"},
        {label: "his_her_conditional", type: "text",apply:'{{#conditional}} {{is_gender_male}}  : her | his {{/conditional}}', detail: "expression"},

        {label: "self_conditional", type: "text",apply:'{{#conditional}} {{is_self}}  :  |  {{/conditional}}', detail: "expression"},

        {label: "conjunction", type: "text",apply:'{{#conjunction}}  {{/conjunction}}', detail: "expression"},
        {label: "in_words", type: "text",apply:'{{#in_words}}  {{/in_words}}', detail: "expression"},
        {label: "choice", type: "text",apply:'{{#choice}}  ||  {{/choice}}', detail: "expression"},
        {label: "ordinal", type: "text",apply:'{{#ordinal}}  {{/ordinal}}', detail: "expression"},
        {label: "pluralize", type: "text",apply:'{{#pluralize }}  :  |  {{/pluralize }}', detail: "expression"},
        {label: "count", type: "text",apply:'{{#count}}  {{/count}}', detail: "expression"},
        {label: "ext_link", type: "text",apply:'[Link]({{#ext_link}}{{/ext_link}})', detail: "expression"},
        {label: "has_suggestions", type: "text",apply:'{{#has_suggestions}}  {{/has_suggestions}}', detail: "expression"},
      ],
    }
  }

  // useEffect(() => {
  //   let _view = editorRef.current?.view;
  //   let length = editorRef?.current?.state?.doc?.length;
  //   // _view?.dispatch({selection: {anchor: length, head: length}, scrollIntoView: true })
  //   // _view?.dispatch({ userEvent: "unselect" });
  // },[currentContext])

  // function moveToLine(view) {
  //   let line = prompt("Which line?")
  //   if (!/^\d+$/.test(line) || +line <= 0 || +line > view.state.doc.lines)
  //     return false
  //   let pos = view.state.doc.line(+line).from
  //   view.dispatch({selection: {anchor: pos}, userEvent: "select"})
  //   return true
  // }

  const extensions = [
    yaml,
    lintGutter(),
    yamlLinter,
    EditorState.readOnly.of(readOnly),
    EditorView.lineWrapping,
    // EditorState.allowMultipleSelections.of(true),
    // keymap.of(defaultKeymap),
    // keymap.of([
    //   { key: 'Ctrl-m', run: moveToLine },
    // ]),
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
      saveYaml(event);  
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
        onKeyDown={hanleKeyPress}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
}
