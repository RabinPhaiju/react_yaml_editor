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
    }else if(word == 'his' || word == 'her' || word == 'him'){
      if(word == 'his'){
        buttons = [
          {
            start:startInDoc,end:endInDoc,
            label: 'his_her',apply:'{{#conditional}} {{is_gender_male}}  : her | his {{/conditional}}',
          }
        ]
      }else if(word == 'him'){
        buttons = [
          {
            start:startInDoc,end:endInDoc,
            label: 'her_him',apply:'{{#conditional}} {{is_gender_male}}  : her | him {{/conditional}}',
          }
        ]
      }else{
        buttons = [
          {
            start:startInDoc,end:endInDoc,
            label: 'his_her',apply:'{{#conditional}} {{is_gender_male}}  : her | his {{/conditional}}',
          },
          {
            start:startInDoc,end:endInDoc,
            label: 'her_him',apply:'{{#conditional}} {{is_gender_male}}  : her | him {{/conditional}}',
          }
        ]
      }
    }else if(word == 'wife' || word == 'husband'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'wife_husband',apply:'{{#conditional}} {{is_gender_male}}  : wife | husband {{/conditional}}',
        }
      ]
    }else if(word == 'timeline'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'perid_in_words',apply:'{{timeline.period_in_words}}',
        }
      ]
    }else if(word == 'planet'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'top_activated_planets',apply:'{{#conjunction}} {{activation_strength.top_activated_planets}} {{/conjunction}}',
        }
      ]
    }
    return buttons;
  }

  export default createSuggestionList;