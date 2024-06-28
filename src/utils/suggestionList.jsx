const createSuggestionList = (pWord,startInDoc,endInDoc) => {
    const word = pWord.toLowerCase();
    let buttons = []
    if(word == 'you'){
      buttons = [
        { start:startInDoc,end: endInDoc,
          label: 'them',apply:'{{them}}',
        },
        { start:startInDoc,end: endInDoc,
          label: 'they',apply:'{{they}}',
        },
        { start:startInDoc,end: endInDoc,
          label: 'native',apply:'{{native}}',
        },
        { start:startInDoc,end: endInDoc,
          label: 'them-they',apply:'{{#conditional}} {{is_self}}  : {{them}} | they {{/conditional}}',
        },
        { start:startInDoc,end: endInDoc,
          label: 'them-them',apply:'{{#conditional}} {{is_self}}  : {{them}} | them {{/conditional}}',
        }
      ];
    }else if(word == 'have'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'has_have',apply:'{{has_have}}',
        }
      ]
    }else if(word == "you're" || word == "you’re"){
      buttons = [
        { start:startInDoc,end: endInDoc,
          label: "you're",apply:'{{they}} {{is_are}}',
        },
        { start:startInDoc,end: endInDoc,
          label: "native're",apply:'{{native}} {{is_are}}',
        }
      ]
    }else if(word == "you've" || word == "you’ve"){
      buttons = [
        { start:startInDoc,end: endInDoc,
          label: "you've",apply:'{{they}} {{has_have}}',
        },
        { start:startInDoc,end: endInDoc,
          label: "native've",apply:'{{native}} {{has_have}}',
        }
      ]
    }else if(word == 'he' || word == 'she'){
      buttons = [
        { start:startInDoc,end: endInDoc,
          label: 'she_he',apply:'{{#conditional}} {{is_gender_male}}  : she | he {{/conditional}}',
        }
      ];
    }else if(word == 'himself' || word == 'herself'){
      buttons = [
        { start:startInDoc,end: endInDoc,
          label: 'himself_herself',apply:'{{#conditional}} {{is_gender_male}}  : herself | himself {{/conditional}}',
        }
      ];
    }else if(word == 'is' || word == 'are'){
      buttons = [
        { start:startInDoc,end: endInDoc,
          label: 'is_are',apply:'{{is_are}}',
        }
      ];
    }else if(word == 'your'){
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
    }else if(word == 'girlfriend' || word == 'boyfriend'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'girl-boy',apply:'{{#conditional}} {{is_gender_male}}  : girlfriend | boyfriend {{/conditional}}',
        }
      ]
    }else if(word == 'daughter' || word == 'son'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'daughter-son',apply:'{{#conditional}} {{is_gender_male}}  : daughter | son {{/conditional}}',
        }
      ]
    }else if(word == 'wife' || word == 'husband'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'wife_husband',apply:'{{#conditional}} {{is_gender_male}}  : wife | husband {{/conditional}}',
        }
      ]
    }else if(word == 'man' || word == 'woman'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'woman_man',apply:'{{#conditional}} {{is_gender_male}}  : woman | man {{/conditional}}',
        }
      ]
    }else if(word == 'guy'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'girl_guy',apply:'{{#conditional}} {{is_gender_male}}  : girl | guy {{/conditional}}',
        }
      ]
    }else if(word == 'female' || word == 'male'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'female_male',apply:'{{#conditional}} {{is_gender_male}}  : female | male {{/conditional}}',
        }
      ]
    }else if(word == 'timeline'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'period_in_words',apply:'{{timeline.period_in_words}}',
        },
        {
          start:startInDoc,end:endInDoc,
          label: 'limit_in_words',apply:'{{timeline.limit_in_words}}',
        }
      ]
    }else if(word == 'planet'){
      buttons = [
        {
          start:startInDoc,end:endInDoc,
          label: 'top_activated_planets',apply:'{{#conjunction}} {{activation_strength.top_activated_planets}} {{/conjunction}}',
        },
        {
          start:startInDoc,end:endInDoc,
          label: 'indicator_planets',apply:'{{#conjunction}} {{connection_algorithm.indicator_planets}} {{/conjunction}}',
        }
      ]
    }
    return buttons;
  }

  export default createSuggestionList;