import React from "react";
import { linter, lintGutter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";
import * as yamlMode from "@codemirror/legacy-modes/mode/yaml";
import { StreamLanguage } from "@codemirror/language";
import parser from "js-yaml";
import { githubLight } from "@uiw/codemirror-theme-github";
import "./codeMirror.css";
import {EditorState} from "@codemirror/state";
import foldOnIndent from "./foldIndent"
import {
  autocompletion,
  completeFromList,
} from "@codemirror/autocomplete";

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

  const yamlAutocomplete = autocompletion({
    override: [completeFromList(suggestions)]
  });

  const extensions = [
    yaml,
    lintGutter(),
    yamlLinter,
    EditorState.readOnly.of(readOnly),
    // EditorState.allowMultipleSelections.of(true),
    yamlAutocomplete,
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

  const handleKeyUp = (event) => {
    if (event.key === '{' ) {
    }
  };

  return (
    <div className="code_mirror">
      <CodeMirror
        height= {readOnly ? '200px' : null}
        onChange={_onChange}
        value={data}
        theme={githubLight}
        extensions={extensions}
        basicSetup= {{
          lineNumbers: true,
          foldGutter: true,
          foldKeymap: true,
        }}
        onKeyDown={hanleKeyPress}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
}
