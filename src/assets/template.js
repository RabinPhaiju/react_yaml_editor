const template1 = `
- template: &likely                  
    - paragraph: |
        
`;
  const template2 = `
- template: &basic_description_title
    - paragraph:
        end: ""
        content:
          - text: "### Basic Description"

- template: &prediction_title
    - paragraph:
        end: ""
        content:
          - text: "### Prediction"

- template: &advice_title
    - paragraph:
        end: ""
        content:
          - text: "### Advice"

- template: &additional_note_title
    - paragraph:
        end: ""
        content:
          - text: "### Additional Note"

- template: &likely                  
    - text: *basic_description_title
    - paragraph: |
        
`;

const template3 = `
- paragraph: |
    

`;


export {template1,template2,template3}