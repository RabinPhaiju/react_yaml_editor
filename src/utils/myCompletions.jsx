function myCompletions(context,contextSuggestions,anchorSuggestions,linkSuggestions,partialSuggestions) {
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

export default myCompletions;